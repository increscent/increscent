/\.page\.html$/ {
    a = $0;
    sub(/\.page\.html$/, ".html", a);
    print $0 " -> " a;
    system("./liza " $0 " > " a);
}
