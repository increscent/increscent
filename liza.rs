// Compile: rustc liza.rs
// Run: ./liza test.html

use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::io::prelude::*;
use std::io::{Error, ErrorKind};
use std::path::Path;

const CONTENTS: &str = "contents";
const TEMPLATE: &str = "template";
const TAG_OPEN: &str = "<comp";
const TAG_CLOSE: &str = ">";
const TAG_CLOSE_FINISH: &str = "/>";
const TAG_FINISH: &str = "</comp>";
const BRACKET_OPEN: &str = "<<";
const BRACKET_CLOSE: &str = ">>";
const VALUE_OPEN: &str = "=\"";
const VALUE_CLOSE: &str = "\"";

fn main() -> std::io::Result<()> {
    match env::args().nth(1) {
        Some(filename) => {
            println!("{}", process_file(&filename, &HashMap::new())?);
        },
        None => {
            println!("Usage: liza <filename>");
        }
    }

    Ok(())
}

/*
 * Returns -1 if the first argument is less, 1 if the second argument is less,
 * and 0 if both are equal (or None)
 */
fn compare_positions(a: Option<usize>, b: Option<usize>) -> i64 {
    match a {
        None =>
            match b {
                None => 0,
                _ => 1
            },
        Some(a_val) =>
            match b {
                None => -1,
                Some(b_val) =>
                    if a_val < b_val {
                        -1
                    } else if a_val > b_val {
                        1
                    } else {
                        0
                    }
            }
    }
}

/*
 * Replace components (<comp template="file.html">...</comp>)
 * with actual file contents.
 */
fn replace_tags(mut text: &str) -> std::io::Result<String> {
    let mut stack: Vec<HashMap<String, String>> = Vec::new();

    let mut initial_map: HashMap<String, String> = HashMap::new();
    initial_map.insert(String::from(CONTENTS), String::from(""));

    stack.push(initial_map);

    loop {
        let open_tag = text.find(TAG_OPEN);
        let close_tag = text.find(TAG_FINISH);

        if compare_positions(open_tag, close_tag) == 0 {
            // No more opening or closing tags
            if stack.len() > 1 {
                return exit_with_message("Missing comp closing tag");
            } else if let Some(mut map) = stack.pop() {
                let contents = map.get_mut(CONTENTS).unwrap();
                contents.push_str(text);
                return Ok(contents.to_string());
            } else {
                return exit_with_message("Too many comp closing tags");
            }
        } else if compare_positions(open_tag, close_tag) == -1 {
            // Opening tag next
            let start_index = open_tag.unwrap();
            if let Some(mut end_index) = text[start_index..].find(TAG_CLOSE) {
                end_index += start_index;
                end_index += 1;

                let map = stack.last_mut().unwrap();
                let contents = map.get_mut(CONTENTS).unwrap();
                contents.push_str(&text[..start_index]);

                let comp_tag = &text[start_index..end_index];

                text = &text[end_index..];

                let mut cur_map: HashMap<String, String> = HashMap::new();

                parse_tag(comp_tag, &mut cur_map)?;

                // Overwrite contents if specified
                cur_map.insert(String::from(CONTENTS), String::from(""));

                if let Some(_) = comp_tag.find(TAG_CLOSE_FINISH) {
                    if let Some(filename) = cur_map.get(TEMPLATE) {
                        contents.push_str(&process_file(filename, &cur_map)?);
                    } else {
                        return exit_with_message("No template specified in comp tag");
                    }
                } else {
                    stack.push(cur_map);
                }
            } else {
                return exit_with_message("No closing bracket found");
            }
        } else {
            // Closing tag next
            let start_index = close_tag.unwrap();
            let end_index = start_index + TAG_FINISH.len();

            if let Some(mut cur_map) = stack.pop() {
                let contents = cur_map.get_mut(CONTENTS).unwrap();
                contents.push_str(&text[..start_index]);

                text = &text[end_index..];

                if let Some(parent_map) = stack.last_mut() {
                    let contents = parent_map.get_mut(CONTENTS).unwrap();

                    if let Some(filename) = cur_map.get(TEMPLATE) {
                        contents.push_str(&process_file(filename, &cur_map)?);
                    } else {
                        return exit_with_message("No template specified in comp tag");
                    }
                } else {
                    return exit_with_message("Too many comp closing tags");
                }

            } else {
                return exit_with_message("Too many comp closing tags");
            }
        }
    }
}

/*
 * Parse comp tag into key value pairs
 */
fn parse_tag(mut text: &str, map: &mut HashMap<String, String>) -> std::io::Result<String> {
    if let Some(_) = text.find(TAG_OPEN) {
        text = &text[TAG_OPEN.len()..];
    } else {
        return exit_with_message("Not a valid comp tag");
    }

    while let Some(c) = text.chars().nth(0) {
        if char::is_whitespace(c) {
            text = &text[1..];
        } else if let Some(i) = text.find(VALUE_OPEN) {
            let key = String::from(&text[..i]);
            text = &text[i+VALUE_OPEN.len()..];

            if let Some(i) = text.find(VALUE_CLOSE) {
                let value = String::from(&text[..i]);
                text = &text[i+VALUE_CLOSE.len()..];

                map.insert(key, value);
            } else {
                return exit_with_message("Value is missing closing quote");
            }
        } else {
            break;
        }
    }

    Ok(String::from(""))
}

/*
 * Replace tokens (<<token_name>>) with their corresponding
 * values in the replace hashmap. Returns the text slice with
 * replacements as a string.
 */
fn replace_tokens(mut text: &str, replace: &HashMap<String, String>) -> std::io::Result<String> {
    let mut result: Vec<&str> = Vec::new();

    while let Some(start_index) = text.find(BRACKET_OPEN) {
        if let Some(mut end_index) = text[start_index..].find(BRACKET_CLOSE) {
            end_index += start_index;
            end_index += 2;

            result.push(&text[..start_index]);

            let replace_key = &text[start_index+2..end_index-2];
            if let Some(replace_value) = replace.get(replace_key) {
                result.push(replace_value);
            } else {
                return exit_with_message(&format!("Missing key to replace: {}", replace_key));
            }

            text = &text[end_index..];
        } else {
            return exit_with_message("No closing brackets found");
        }
    }

    result.push(text);

    let output = result.iter().map(|x| *x).collect::<String>();

    Ok(output)
}

fn process_file(filename: &str, replace: &HashMap<String, String>) -> std::io::Result<String> {
    let p = Path::new(filename);
    let prev_path = env::current_dir()?;
    let path = if p.is_relative() { prev_path.join(p) } else { p.to_path_buf() };

    let mut file = File::open(path.to_path_buf())?;

    if let Some(new_path) = path.parent() {
        env::set_current_dir(&new_path)?;
    }

    let mut contents = String::new();

    file.read_to_string(&mut contents)?;

    let ready_text = replace_tokens(&contents[..], replace)?;

    let result = replace_tags(&ready_text[..]);

    env::set_current_dir(&prev_path)?;

    return result;
}

fn exit_with_message(message: &str) -> std::io::Result<String> {
    Err(
        Error::new(ErrorKind::InvalidData, message)
    )
}
