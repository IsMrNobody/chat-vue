<template>
  <v-row align="center" justify="center">
    <v-col cols md="6">
      <div>
        <v-toolbar color="primary">
          <v-toolbar-title>
            Ingresa tu Email y Contraseña
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="email" autofocus label="Email"></v-text-field>
          <v-text-field
            v-model="password"
            clearable
            label="Password"
            type="password"
            @keyup.enter="ingresar"
          ></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-row justify="end">
            <v-btn color="primary" block @click="ingresar">Ingresar</v-btn>
          </v-row>
        </v-card-text>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { auth, db } from '@/plugins/firebase'
export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    async ingresar() {
      if (!this.email) {
        this.enviarNotificacion('debes escribir un email', 'warning')
        return
      }
      if (!this.password) {
        this.enviarNotificacion('debes escribir un pass', 'warning')
        return
      }
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password)
        // console.log(this.email, this.password)

        if (auth.currentUser) {
          const uid = auth.currentUser.uid
          const doc = await db.collection('usuarios').doc(uid).get()

          if (doc.exists) {
            const usuario = doc.data()
            this.$emit(`onIngresar`, usuario)
          } else {
            this.enviarNotificacion('no se encontro usuario', 'error')
          }
        }
      } catch (error) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth-wrong-password':
            this.enviarNotificacion('usuario no valido', 'warning')
            break

          default:
            this.enviarNotificacion(
              'ocurrio un error verificando la info',
              'error'
            )
            break
        }
        // console.log(error.message)
      }
      this.email = ''
      this.password = ''
    },
    enviarNotificacion(mensaje, color) {
      this.$emit('onNotificacion', { mensaje, color })
    },
  },
}
</script>

<style scoped>
.fuente {
  font-family: 'Lemonada', cursive;
}
</style>
