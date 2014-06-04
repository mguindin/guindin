package guindin

import (
	"text/template"
	"net/http"
	"path/filepath"
	"fmt"
	"strings"
	"github.com/kjk/u"
)

type Page struct {
	Title string
	Body  []byte
}

func init() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/favicon.ico", handleFavicon)
	http.HandleFunc("/public/css/", handleCss)
	http.HandleFunc("/public/img/", handleImg)
	http.HandleFunc("/public/ico/", handleIco)
	http.HandleFunc("/public/js/", handleJs)
}

func renderIndex(w http.ResponseWriter) {
	t := template.Must(template.New("Index.html").ParseGlob(filepath.Join(getTmplDir(), "*")))
	err := t.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	renderIndex(w)
}

func getPublicDir() string {
	return "public"
}

func getAppDir() string {
	return "app"
}

func getViewsDir() string {
	return filepath.Join(getAppDir(), "views")
}

func getTmplDir() string {
	return filepath.Join(getViewsDir(), "tmpl")
}

func getErrorDir() string {
	return filepath.Join(getViewsDir(), "errors")
}

// url: /favicon.ico
func handleFavicon(w http.ResponseWriter, r *http.Request) {
	serveFileFromDir(w, r, getIcoDir(), "favicon.ico")
}

func handleCss(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path[len("/public/css/"):]
	serveFileFromDir(w, r, getCssDir(), file)
}

func handleJs(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path[len("/public/js/"):]
	serveFileFromDir(w, r, getJsDir(), file)
}

func handleIco(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path[len("/public/ico"):]
	serveFileFromDir(w, r, getIcoDir(), file)
}

func handleImg(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path[len("/public/img"):]
	serveFileFromDir(w, r, getImgDir(), file)
}

func getIcoDir() string {
	return filepath.Join(getPublicDir(), "ico")
}

func getCssDir() string {
	return filepath.Join(getPublicDir(), "css")
}

func getImgDir() string {
	return filepath.Join(getPublicDir(), "img")
}

func getJsDir() string {
	return filepath.Join(getPublicDir(), "js")
}

func serveFileFromDir(w http.ResponseWriter, r *http.Request, dir, fileName string) {
	if redirectIfFoundMatching(w, r, dir, fileName) {
		return
	}
	filePath := filepath.Join(dir, fileName)
	if u.PathExists(filePath) {
		http.ServeFile(w, r, filePath)
	} else {
		serve404(w, r)
	}
}

func redirectIfFoundMatching(w http.ResponseWriter, r *http.Request, dir, fileName string) bool {
	var files []string
	ok := false
	if files, ok = filesPerDir[dir]; !ok {
		files = u.ListFilesInDir(dir, true)
		n := len(dir) + 1
		for i, f := range files {
			files[i] = f[n:]
		}
		filesPerDir[dir] = files
	}
	for _, f := range files {
		if strings.HasPrefix(fileName, f) {
			if fileName == f {
				return false
			}
			diff := len(fileName) - len(f)
			url := r.URL.Path
			url = url[:len(url)-diff]
			http.Redirect(w, r, url, 302)
			return true
		}
	}
	return false
}

func getReferer(r *http.Request) string {
	return r.Header.Get("Referer")
}

func serve404(w http.ResponseWriter, r *http.Request) {
	if (getReferer(r) != "") {
		fmt.Printf("404: '%s', referer: '%s'", r.URL.Path, getReferer(r))
	}
	http.NotFound(w, r)
}

var filesPerDir = make(map[string][]string)
