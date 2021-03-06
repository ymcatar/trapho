<!-- component for the upload photo tab -->
<name>photo-feed-tab-upload</name>

<template>
  <div class="tab-upload-contaier">
    <div class="tab-upload-main">
      <!-- select file -->
      <div>
        <div class="photo-upload-header">Select file</div>
        <div id="upload-dropzone" class="dropzone"></div>
      </div>
      <!-- info -->
      <div v-if="active && uploadedFiles.length > 0">
        <!-- description -->
        <md-divider></md-divider>
        <div class="photo-upload-header">Description (click image to add caption)</div>
        <waterfall
          :line-gap="300"
          :watch="uploadedFiles">
          <waterfall-slot
            v-for="(file, index) in uploadedFiles"
            class="upload-photo-preview"
            move-class="item-move"
            :width="file.width"
            :height="file.height + 100"
            :order="index"
            :key="index">
            <md-card md-with-hover class="upload-photo-preview" @click.native="openDescriptionModal(index)">
              <md-image :md-src="getPhotoUrl(file.url)"></md-image>
              <md-tooltip v-if="file.description" md-direction="top">
                {{file.description}}
              </md-tooltip>
            </md-card>
          </waterfall-slot>
        </waterfall>
        <!-- location -->
        <md-divider></md-divider>
        <div class="photo-upload-header">Location</div>
        <md-card>
          <md-card-content style="padding: 0px;">
            <common-map :onChange="onMapChange"></common-map>
          </md-card-content>
        </md-card>
      </div>
      <md-button class="md-raised md-primary submit-button" :disabled="!isCompleted" @click.native="submit">Submit</md-button>
      <!-- description dialog -->
      <md-dialog ref="dialog">
        <md-dialog-title>Add photo description</md-dialog-title>
        <md-dialog-content>
          <md-input-container>
            <label>Caption</label>
            <md-textarea v-model="dialogDescription"></md-textarea>
          </md-input-container>
          <md-input-container>
            <label>Rating (1 - 10)</label>
            <md-input type="number" min="1" max="10" v-model="dialogRating"></md-input>
          </md-input-container>
          <md-chips v-model="dialogTags" md-input-placeholder="Tags">
            <template scope="chip">{{chip.value}}</template>
          </md-chips>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click.native="closeDescriptionModal">Add</md-button>
        </md-dialog-actions>
      </md-dialog>
      <!-- snackbar -->
      <md-snackbar ref="snackbar" :md-duration="2000">
        <span>Upload successful.</span>
      </md-snackbar>
    </div>
  </div>
</template>

<style>
.tab-upload-contaier {
  display: flex;
  justify-content: center;
}
.submit-button {
  margin-top: 10px;
}
.tab-upload-main {
  max-width: 800px;
  width: 100%;
}
.photo-upload-header {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: bolder;
  color: white;
}
.item-move {
  transition: all .5s cubic-bezier(.55,0,.1,1);
  -webkit-transition: all .5s cubic-bezier(.55,0,.1,1);
}
.upload-photo-preview {
  margin: 10px;
}
#upload-dropzone {
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #eee;
  margin-bottom: 20px;
}
.dz-default {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: lighter;
  font-size: 22px;
  color: #aaa;
}
</style>

<script>
import Vue from 'vue';
import Dropzone from 'dropzone';
import Waterfall from 'vue-waterfall/lib/waterfall';
import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';

import { UPLOAD_PATH, getPhotoUrl, post } from '../../../utils.js';

Dropzone.autoDiscover = false;

export default {
  props: [
    'active' // whether this tab is currently active
  ],
  components: {
    Waterfall,
    WaterfallSlot
  },
  data: () => ({
    uploadedFiles: [], // list of uploaed files
    dialogCurrentIndex: null, // the index of the current photo associated with the dialog
    dialogDescription: '', // input value field for photo description
    dialogRating: null, // rating field
    dialogTags: [], // photo tags field
    selectedLocation: null, // the locationId of the selected location
    dropzone: null // the dropzone component instance
  }),
  computed: {
    // whether the form has been component
    isCompleted: function() {
      return this.uploadedFiles.length > 0 && !!this.selectedLocation;
    }
  },
  // on component rendered
  mounted: function() {
    // initialize a new drop zone instane
    this.dropzone = new Dropzone('#upload-dropzone', {
      url: UPLOAD_PATH,
      acceptedFiles: 'image/*',
      paramName: 'files',
      headers: {
        'Authorization': `Bearer ${localStorage.token}`
      }
    });
    // triggered when an image uploaded
    this.dropzone.on('success', (file, res, test) => {
      const { width, height } = file;
      res.width = width;
      res.height = height;
      this.uploadedFiles.push(res); // push the image just uploaded to the this.uploadedFiles
    });
    this.clear();
  },
  methods: {
    getPhotoUrl,
    // method to set everything to inital state
    clear: function() {
      this.selectedLocation = null;
      this.uploadedFiles = [];
      this.dropzone.removeAllFiles(); // remove all uploaded file from dropzone instance
    },
    // triggered when a description modal opened
    openDescriptionModal: function(index) {
      // set the description value to the value of uploaded value
      this.dialogDescription = this.uploadedFiles[index].description;
      this.dialogRating = this.uploadedFiles[index].rating || 10; // by default give a 10 rating
      this.dialogTags = this.uploadedFiles[index].tags;

      // if dialogTag is not an array, set to a default value
      if (!_.isArray(this.dialogTags)) {
        Vue.set(this, 'dialogTags', []);
      }

      this.dialogCurrentIndex = index;
      this.$refs.dialog.open(); // display the modal
    },
    closeDescriptionModal: function() {
      // save the value to this.uploadedFiles
      Vue.set(this.uploadedFiles[this.dialogCurrentIndex], 'description', this.dialogDescription);
      Vue.set(this.uploadedFiles[this.dialogCurrentIndex], 'rating', this.dialogRating);
      Vue.set(this.uploadedFiles[this.dialogCurrentIndex], 'tags', this.dialogTags);
      this.dialogCurrentIndex = null;
      this.$refs.dialog.close(); // close the diagram
    },
    // method triggered when the selected location is changed
    onMapChange: function(location) {
      this.selectedLocation = location;
    },
    // method to submit tab upload
    submit: async function() {
      const locationId = this.selectedLocation.id;
      // submitted the list of uploaded photos to backend
      const payloads = this.uploadedFiles.map(({ url, height, width, description, rating, tags }) => ({
        url, description, locationId, rating: parseInt(rating), photoTags: tags
      }));
      try {
        await Promise.all(payloads.map(
          payload => post(this.$router, 'photos', payload)
        ));
        this.$refs.snackbar.open(); // show the success message
        this.clear();
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>