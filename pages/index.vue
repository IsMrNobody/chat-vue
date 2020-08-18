<template>
  <v-container fluid fill-height>
    <v-col v-if="usuario">
      <!-- <v-row justify="center">
        <v-avatar size="140" elevation-10>
          <v-img :src="usuario.foto"></v-img>
        </v-avatar>
      </v-row>
      <v-row justify="center">
        <span>{{ usuario.nombre }}</span>
      </v-row> -->
      <v-row justify="center">
        <v-btn class="mt-4" text small color="primary" @click="usuario = null"
          >salir</v-btn
        >
      </v-row>
    </v-col>
    <v-row>
      <Login v-if="!usuario" @onIngresar="ingresar" @onNotificacion="mostrar" />
    </v-row>
    <v-row v-if="usuario" justify="center">
      <Chat :usuario="usuario" @onNotificacion="mostrar" />
    </v-row>

    <v-snackbar
      v-model="notificacion.snackbar"
      :color="notificacion.color"
      top
      :timeout="6000"
      dark
    >
      <span>{{ notificacion.mensaje }}</span>
      <v-btn text @click="notificacion.snackbar = false">cerrar</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import Login from '@/components/Login'
import Chat from '@/components/Chat'
export default {
  components: {
    Login,
    Chat,
  },
  data() {
    return {
      usuario: null,
      notificacion: {
        mensaje: '',
        color: 'info',
        snackbar: false,
      },
    }
  },
  methods: {
    ingresar(usuario) {
      this.usuario = usuario
    },
    mostrar(notificacion) {
      this.notificacion.mensaje = notificacion.mensaje
      this.notificacion.color = notificacion.color
      this.notificacion.snackbar = true
    },
  },
}
</script>
