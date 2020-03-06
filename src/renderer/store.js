"use strict";

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const configuration = {
    strict: process.env.NODE_ENV !== "production",
    state: reset(),
    mutations: {
        setFolder(state, payload) {
            this.state.folder = payload.folder;
        }
    },
    actions: {},
    getters: {}
};
export const store = new Vuex.Store(configuration);

function reset() {
    return {
        folder: null
    };
}