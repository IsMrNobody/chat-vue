<template>
  <v-row v-resize="onResize">
    <v-col v-if="mostrarLista" cols sm="4">
      <v-card>
        <v-toolbar color="primary">
          <v-toolbar-title dark dense>
            contatos
          </v-toolbar-title>
        </v-toolbar>
        <v-list active-class="pink--text" two-line>
          <template v-for="usuario in usuarios">
            <v-list-item
              :key="usuario.uid"
              :value="userSelet && userSelet.uid == usuario.uid"
              @click="userSeleted(usuario)"
            >
              <v-list-item-avatar size="40">
                <v-img :src="usuario.foto"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="usuario.nombre"></v-list-item-title>
                <v-list-item-subtitle
                  v-html="usuario.ultimoMensaje"
                ></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="usuario.cantidadMensaje > 0">
                <v-badge>
                  <span slot="badge">{{ usuario.cantidadMensaje }}</span>
                </v-badge>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-col>
    <v-col v-if="mostrarChat">
      <v-container class="pa-0 ma-0">
        <v-col class="mar" align="end">
          <v-col>
            <v-card color="#363636">
              <v-toolbar color="primary">
                <v-toolbar-title>
                  <v-icon v-if="esMovil" @click="regresar"
                    >mdi-arrow-left-thick</v-icon
                  >
                  <v-avatar size="40">
                    <v-img :src="userSelet.foto"></v-img>
                  </v-avatar>
                  <span>{{ userSelet.nombre }}</span>
                </v-toolbar-title>
              </v-toolbar>
              <v-container class="pa-0 ma-0 scroll-y">
                <v-card-text
                  ref="chatContainer"
                  class="overflow"
                  :style="'max-height: ' + height + 'px;'"
                >
                  <v-col
                    v-for="item in chat"
                    :key="item.mid"
                    cols="8"
                    :offset-sm="5 & (item.uid == usuario.uid)"
                  >
                    <v-row>
                      <div class="chat-fecha">
                        {{ convertirFecha(item.fechaEnvio) }}
                      </div>
                      <v-card
                        :color="item.uid != usuario.uid ? '#092532' : '#84a9ac'"
                        class="chat-mensaje"
                      >
                        <v-card-text>
                          <div>{{ item.texto }}</div>
                        </v-card-text>
                      </v-card>
                    </v-row>
                  </v-col>
                </v-card-text>
              </v-container>
              <v-card-text>
                <v-text-field
                  ref="textMensaje"
                  v-model="mensaje"
                  autofocus
                  :loading="enviandoMensaje"
                  :disabled="enviandoMensaje"
                  hide-details
                  label="Escribe un mensaje"
                  @keyup.enter="enviarMensaje"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-col>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { db } from '@/plugins/firebase'
import uuid from 'uuid/dist/v4'
export default {
  props: ['usuario'],
  data() {
    return {
      usuarios: [],
      userSelet: null,
      chat: [],
      mensaje: '',
      enviandoMensaje: false,
      cid: null,
      detenerChat: null,
      height: 0,
    }
  },
  computed: {
    esMovil() {
      return this.$vuetify.breakpoint.width < 600
    },
    mostrarLista() {
      return this.usuarios && (!this.esMovil || !this.userSelet)
    },
    mostrarChat() {
      return this.usuarios && this.userSelet
    },
  },
  created() {
    this.consultarUsuarios()
  },
  methods: {
    onResize() {
      this.height = window.innerHeight - 320
    },
    convertirFecha(timeStamp) {
      return timeStamp.toDate().toISOString().substring(0, 16).replace('T', ' ')
    },
    generarChatId(uid1, uid2) {
      return uid1 < uid2 ? `${uid1}-${uid2}` : `${uid2}-${uid1}`
    },
    regresar() {
      this.userSelet = null
    },
    enviarNotificacion(mensaje, color) {
      this.$emit('onNotificacion', { mensaje, color })
    },
    async userSeleted(usuario) {
      this.cid = this.generarChatId(this.usuario.uid, usuario.uid)
      try {
        const doc = await db.collection('contactos').doc(this.cid).get()
        if (!doc.exists) {
          await db.collection('contactos').doc(this.cid).set({ cid: this.cid })
        }
        this.userSelet = usuario
        this.consultarChat()
      } catch (error) {
        this.enviarNotificacion('ocurrio un error al enviar info', 'error')
      }
    },
    consultarChat() {
      this.chat = []
      if (this.detenerChat) {
        this.detenerChat()
      }
      this.detenerChat = db
        .collection('contactos')
        .doc(this.cid)
        .collection('chat')
        .orderBy('fechaEnvio')
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const mensaje = change.doc.data()
                this.chat.push(mensaje)

                if (
                  !mensaje.fechaEnvio &&
                  mensaje.uid !== this.usuario.uid
                ) {
                  this.marcarMensajeLeido(mensaje)
                }
              }
              this.$nextTick(() => {
                if (this.$refs.chatContainer) {
                  this.$refs.chatContainer.scrollTop = 10000
                }
              })
            })
          },
          () => {
            this.enviarNotificacion('ocurrio un error', 'error')
          }
        )
    },
    marcarMensajeLeido(mensaje) {
      const batch = db.batch()

      batch.update(
        db
          .collection('contactos')
          .doc(this.cid)
          .collection('chat')
          .doc(mensaje.mid),
        { fechaEnvio: new Date() }
      )
      batch.delete(
        db
          .collection('usuarios')
          .doc(this.usuario.uid)
          .collection('chat-sin-leer')
          .doc(mensaje.mid)
      )

      batch.commit()
    },
    async consultarUsuarios() {
      try {
        const docs = await db.collection('usuarios').get()
        docs.forEach((doc) => {
          const usuario = doc.data()
          if (usuario.uid !== this.usuario.uid) {
            usuario.cantidadMensaje = 0
            usuario.ultimoMensaje = ''
            this.usuarios.push(usuario)
          }
        })
        this.consultarChatSinLeer()
      } catch (error) {
        this.enviarNotificacion(
          'ocurrio un error en la lista de contactos',
          'warning'
        )
        // console.log(error)
      }
    },
    consultarChatSinLeer() {
      db.collection('usuarios')
        .doc(this.usuario.uid)
        .collection('chat-sin-leer')
        .orderBy('fechaEnvio')
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const mensaje = change.doc.data()
              const usuario = this.usuarios.find((u) => u.uid === mensaje.uid)
              if (usuario) {
                switch (change.type) {
                  case 'added':
                    usuario.cantidadMensaje++
                    usuario.ultimoMensaje = mensaje.texto
                    break
                  case 'removed':
                    usuario.cantidadMensaje--
                    usuario.ultimoMensaje = ''
                    if (usuario.cantidadMensaje < 0) {
                      usuario.cantidadMensaje = 0
                    }
                    break
                }
              }
            })
          },
          () => {
            this.enviarNotificacion(
              'Ocurrio un error recuperando mensajes',
              'error'
            )
          }
        )
    },
    async enviarMensaje() {
      if (!this.mensaje || this.enviandoMensaje) {
        return
      }
      this.enviandoMensaje = true
      const mid = uuid()
      const mensajeEnviado = {
        mid,
        texto: this.mensaje,
        fechaEnvio: new Date(),
        uid: this.usuario.uid,
      }
      // const batch = db.batch()

      // batch.update(
      //   db.collection('contactos').doc(this.cid).collection('chat'),
      //   mensajeEnviado
      // )
      // batch.update(
      //   db
      //     .collection('usuarios')
      //     .doc(this.userSeleted.uid)
      //     .collection('chat-sin-leer'),
      //   mensajeEnviado
      // )
      // await batch.commit()
      try {
        await db
          .collection('contactos')
          .doc(this.cid)
          .collection('chat')
          .doc(mid)
          .set(mensajeEnviado)
        await db
          .collection('usuarios')
          .doc(this.userSelet.uid)
          .collection('chat-sin-leer')
          .doc(mid)
          .set(mensajeEnviado)
        this.mensaje = ''
      } catch (error) {
        this.enviarNotificacion('ocurrio un error enviando mensaje', 'error')
      } finally {
        this.enviandoMensaje = false
        this.$nextTick(() => {
          if (this.$refs.textMensaje) {
            this.$refs.textMensaje.focus()
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.bg-user {
  background-color: blueviolet;
}
.chat-mensaje {
  border-radius: 12px;
}
.chat-fecha {
  font-size: 0.6rem;
  margin: 3px;
  color: grey;
}
.overflow {
  overflow-y: scroll;
  overflow-x: hidden;
}
.mar {
  /* margin-top: 50px; */
}
</style>
