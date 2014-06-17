package main

import (
	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"
	"fmt"
	"github.com/kjk/u"
	"github.com/mguindin/goLunch/lunchLib"
	"io/ioutil"
	"math/rand"
	"net/http"
	"path/filepath"
	"strings"
	"text/template"
	"time"
)

type Page struct {
	Title string
	Body  []byte
}

func init() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/index.html", indexHandler)
	http.HandleFunc("/lunch-submit", lunchSelectHandler)
	http.HandleFunc("/oasis.html", oasisHandler)
	http.HandleFunc("/lunch.html", lunchHandler)
	http.HandleFunc("/favicon.ico", handleFavicon)
	http.HandleFunc("/public/css/", handleCss)
	http.HandleFunc("/public/img/", handleImg)
	http.HandleFunc("/public/ico/", handleIco)
	http.HandleFunc("/public/js/", handleJs)
}

func renderPage(w http.ResponseWriter, name string) {
	t := template.Must(template.New(name).ParseGlob(filepath.Join(getTmplDir(), "*")))
	err := t.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	renderPage(w, "Index.html")
}

func lunchSelectHandler(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	cuisine := r.FormValue("cuisine")
	radius := r.FormValue("random")
	location := r.FormValue("location")
	latlong := r.FormValue("latlong")
	choice := rand.Intn(10)
	res := processLunch(radius, location, latlong, cuisine, choice, c)
	t := template.Must(template.New("Lunch.html").ParseGlob(filepath.Join(getTmplDir(), "*")))
	err := t.Execute(w, res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func oasisHandler(w http.ResponseWriter, r *http.Request) {
	renderPage(w, "Oasis.html")
}

func lunchHandler(w http.ResponseWriter, r *http.Request) {
	renderPage(w, "Lunch.html")
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
	if getReferer(r) != "" {
		fmt.Printf("404: '%s', referer: '%s'", r.URL.Path, getReferer(r))
	}
	http.NotFound(w, r)
}

var filesPerDir = make(map[string][]string)

//Lunch portion

type password struct {
	Value string
}

func processLunch(radius string, location string, latlong string, cuisine string, choice int, c appengine.Context) string {
	lunch := lunchLib.Lunch{
		Radius:   radius,
		Location: "&location=" + location,
		Debug:    false,
		Cuisine:  cuisine,
		Yelp_url: "http://api.yelp.com/business_review_search?",
		Rating:   0,
		Rev:      make(map[string]interface{}),
		Choice:   choice}
	yelp_key := getYelpKey(c)
	if latlong != "" {
		//let's use geolocation instead
		lunch.Location = "&" + latlong
	}
	if lunch.Debug {
		fmt.Println(lunch.BuildYelpUrl(yelp_key))
		fmt.Printf("%+v\n", lunch)
		return lunch.BuildYelpUrl(yelp_key)
	} else {
		body, err := makeRequest(yelp_key, c, lunch)
		if err != nil {
			return err.Error()
		} else {
			return lunch.ProcessYelpReturn(body)
		}
	}
}

// guestbookKey returns the key used for all guestbook entries.
func passwordYelpKey(c appengine.Context) *datastore.Key {
	// The string "default_guestbook" here could be varied to have multiple guestbooks.
	return datastore.NewKey(c, "Password", "yelp", 0, nil)
}

func getYelpKey(c appengine.Context) string {
	pass := new(password)
	err := datastore.Get(c, passwordYelpKey(c), pass)
	if err == nil {
		return pass.Value
	} else {
		return err.Error()
	}
}
func makeRequest(yelp_key string, c appengine.Context, lunch lunchLib.Lunch) ([]byte, error) {
	t := urlfetch.Transport{Context: c, Deadline: 30 * time.Second}
	client := http.Client{Transport: &t}
	resp, err := client.Get(lunch.BuildYelpUrl(yelp_key))
	var b []byte
	if err != nil {
		return b, err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	return body, err
}
