package controllers

import (
    "github.com/revel/revel"
    "time"
    "strconv"
)
func init() {
    revel.TemplateFuncs["currentYear"] = func() string { 
        t := time.Now()
        year, _, _ := t.Date()
        return string(year)
    }
}

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}

func (c App) Oasis() revel.Result {
    return c.Render()
}

func (c App) CurrentYear() string {
    t := time.Now()
    year, _, _ := t.Date()
    return strconv.Itoa(year)
}
