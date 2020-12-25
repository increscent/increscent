/\.root\.html$/ {
    a = $0;
    sub(/\.root\.html$/, ".html", a);
    print $0 " -> " a;
    system("./liza " $0 " > " a);
}
