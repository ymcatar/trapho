<!-- this component is the header logo + menu component that is visible at the top of all pages -->
<name>main-header</name>

<template>
  <div class="main-toolbar-main">
    <md-whiteframe md-elevation="2">
      <md-toolbar class="main-toolbar">
        <md-button class="md-icon-button" v-if="userHasLogin" @click.native="toggleSidenav">
          <md-icon class="menu-icon">menu</md-icon>
        </md-button>
        <!-- Trapho logo -->
        <div class="logo">
          <md-image :md-src="logopath" class="logo-img" style="image-rendering: -webkit-optimize-contrast;"></md-image>
        </div>
      </md-toolbar>
    </md-whiteframe>
    <!-- the side navigation menu, visible only if user has logined -->
    <md-sidenav v-if="userHasLogin" class="md-left" ref="sidenav">
      <md-toolbar class="md-large">
        <div class="md-toolbar-container">
        </div>
      </md-toolbar>
      <md-list>

        <!-- link to Photo Feed -->
        <md-list-item @click.native="goToPhotoFeed">
          <md-icon>photo_library</md-icon>
          <span>Photo Feed</span>
        </md-list-item>

        <md-divider></md-divider>

        <!-- link to the Profile page of current user -->
        <md-list-item @click.native="goToProfile">
          <md-icon>account_circle</md-icon>
          <span>My Profile</span>
        </md-list-item>

        <!-- link to the Edit Profile page of current user -->
        <md-list-item @click.native="goToEdit">
          <md-icon>edit</md-icon>
          <span>Edit My Profile</span>
        </md-list-item>

        <md-divider></md-divider>

        <!-- link to the Trip planning (location selected) page -->
        <md-list-item @click.native="goToPlan">
          <md-icon>flight_takeoff</md-icon>
          <span>Plan My Trip</span>
        </md-list-item>

        <md-divider></md-divider>

        <!-- link to logout -->
        <md-list-item @click.native="logout">
          <md-icon>exit_to_app</md-icon>
          <span>Logout</span>
        </md-list-item>
      </md-list>
    </md-sidenav>
  </div>
</template>

<style>
.main-toolbar-main {
  z-index: 999;
}
.main-toolbar {
  background-color: white !important;
  opacity: 0.9;
}
.logo-img {
  margin: 0px 10px 0px 5px;
  height: 40px;
}
.menu-icon {
  color: black;
}
</style>

<script>
  import Vue from 'vue';
  import * as _ from 'lodash';
  import { mapGetters } from 'vuex';

  import logopath from '../../static/logo.png';

  export default {
    data: () => ({
      logopath // image path of the logo
    }),
    computed: {
      ...mapGetters([
        'userHasLogin'  // whether or not the user has logined
      ]),
      userId: function () { // current user id
        return this.$store.state.User.info.id;
      }
    },
    methods: {
      toggleSidenav: function() { // toggle the side navigation panel
        this.$refs.sidenav.toggle();
      },
      // menu item functions, the name should be a good indicator of their feature
      goToProfile: function () {
        this.$router.push(`/profile/${this.userId}`);
        this.$refs.sidenav.close(); // close the panel
      },
      goToPhotoFeed: function () {
        this.$router.push('/feed');
        this.$refs.sidenav.close(); // close the panel
      },
      goToPlan: function () {
        this.$router.push('/plan-select');
        this.$refs.sidenav.close(); // close the panel
      },
      goToEdit: function () {
        this.$router.push('/edit');
        this.$refs.sidenav.close(); // close the panel
      },
      logout: function () {
        delete localStorage.token; // remove the user token
        this.$store.commit('userLogout');
        this.$router.push('/');
        this.$refs.sidenav.close(); // close the panel
      },
    }
  };
</script>