package main

import (
  "log"
  "net/http"  
  "github.com/googollee/go-socket.io"
)

func main() {
  server, err := socketio.NewServer(nil)

  if err != nil {
    log.Fatal(err)
  }

  server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		log.Println("connected:", s.ID())
		return nil
	})

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./pages")))
	log.Println("Server on port 3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}