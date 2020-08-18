import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const config = {
  apiKey: 'AIzaSyAVVLSMc2hCRYmjdbVp7o69n6vbqZzw3UI',
  authDomain: 'chat-vue-f61ce.firebaseapp.com',
  databaseURL: 'https://chat-vue-f61ce.firebaseio.com',
  projectId: 'chat-vue-f61ce',
  storageBucket: 'chat-vue-f61ce.appspot.com',
  messagingSenderId: '858641605718',
  appId: '1:858641605718:web:53b316b52ea1fefe0047f7',
  measurementId: 'G-9TGVLBKM47',
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

export const db = firebase.firestore()
export const auth = firebase.auth()
