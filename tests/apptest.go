package tests

import (
    "github.com/mguindin/guindin/app/controllers"
    "github.com/revel/revel"
)

type ApplicationTest struct {
    revel.TestSuite
    controllers.App
}

func (t *ApplicationTest) Before() {
    println("Set up")
}

func (t *ApplicationTest) TestThatIndexPageWorks() {
    t.Get("/")
    t.AssertOk()
    t.AssertContentType("text/html; charset=utf-8")
}

func (t *ApplicationTest) TestCurrentYear() {
    println(t.CurrentYear())
    t.Assert(t.CurrentYear() != "2013")
}

func (t *ApplicationTest) After() {
    println("Tear down")
}
