set autoindent
set tabstop=4
set shiftwidth=4
"set tabstop=2
"set shiftwidth=2
set softtabstop=0
set expandtab
set smarttab
set nohlsearch
set pastetoggle=<F2>
map <Enter> o<ESC>
map <S-Enter> O<ESC>
"map <C-W> :w<Enter>
map <C-H> :w<Enter>
map <C-X> :wq<Enter>
map <C-J> <C-E>
map <C-K> <C-Y>

"syntax off
syntax on

filetype plugin indent on

nnoremap , :exec "normal i".nr2char(getchar())."\e"<CR>

colorscheme ron

" no annoying auto comments
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
