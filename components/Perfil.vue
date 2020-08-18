<template>
  <v-card class="mx-auto text-xs-center" outlined>
    <v-list-item three-line>
      <v-list-item-avatar tile size="80" color="grey">
        <v-img :src="usuario.foto"></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <!-- <div class="overline mb-4">Perfil</div> -->
        <v-list-item-title class="headline mb-1">{{
          usuario.nombre
        }}</v-list-item-title>
        <v-list-item-subtitle></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <!-- <v-card-actions>
      <v-btn text>Button</v-btn>
      <v-btn text>Button</v-btn>
    </v-card-actions> -->
  </v-card>
</template>

<script>
export default {
  props: ['usuario'],
  data() {
    return {}
  },
}
</script>
