package lunchS

import (
	"appengine"
	"appengine/datastore"
	"appengine/urlfetch"
	"fmt"
	"github.com/mguindin/goLunch/lunchLib"
	"io/ioutil"
	"net/http"
	"time"
)

type Password struct {
	Value string
}

func ProcessLunch(radius string, location string, latlong string, cuisine string, choice int, c appengine.Context) string {
	lunch := lunchLib.Lunch{
		Radius:   radius,
		Location: "&location=" +location,
		Debug:    false,
		Cuisine:  cuisine,
		Yelp_url: "http://api.yelp.com/business_review_search?",
		Rating:   0,
		Rev:      make(map[string]interface{}),
		Choice:   choice}
	yelp_key := getYelpKey(c)
	if (latlong != "") {
		//let's use geolocation instead
		lunch.Location = "&" + latlong
	}
	if lunch.Debug {
		fmt.Println(lunch.BuildYelpUrl(yelp_key))
		fmt.Printf("%+v\n", lunch)
		return lunch.BuildYelpUrl(yelp_key)
	} else {
		return lunch.ProcessYelpReturn(makeRequest(yelp_key, c, lunch))
	}
}

// guestbookKey returns the key used for all guestbook entries.
func passwordYelpKey(c appengine.Context) *datastore.Key {
	// The string "default_guestbook" here could be varied to have multiple guestbooks.
	return datastore.NewKey(c, "Password", "yelp", 0, nil)
}

func getYelpKey(c appengine.Context) string {
	pass := new(Password)
	err := datastore.Get(c, passwordYelpKey(c), pass)
	if (err == nil) {
		return pass.Value
	} else {
		return err.Error() //will error out
	}
}
func makeRequest(yelp_key string, c appengine.Context, lunch lunchLib.Lunch) []byte {
	t := urlfetch.Transport{Context:c, Deadline: 10 * time.Second}
	client := http.Client{Transport: &t}
	resp, err := client.Get(lunch.BuildYelpUrl(yelp_key))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	//fmt.Print(string(body))
	return body
}
