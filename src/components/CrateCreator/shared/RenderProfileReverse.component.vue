<template>
    <div class="flex flex-col">
        <div class="text-xl">
            This item is connected to:
        </div>
        <div
            v-for="(items, property, idx) of container['@reverse']"
            :key="idx"
            class="my-1"
        >
            <div class="flex flex-row flex-wrap">
                <div
                    v-for="reference of items"
                    :key="loopKey({ property, uuid: reference.uuid })"
                >
                    <render-profile-reverse-item-component
                        class="m-1"
                        :property="property"
                        :itemId="uuid"
                        :parentId="reference.uuid"
                        @refresh-parent="$emit('refresh-parent')"
                        @close="$emit('close')"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {
        RenderProfileReverseItemComponent: () =>
            import("./RenderProfileReverseItem.component.vue"),
    },
    props: {
        uuid: {
            type: String,
            required: true,
        },
    },
    data() {
        return {};
    },
    computed: {
        container: function() {
            return this.$store.getters.getItemById(this.uuid);
        },
    },
    methods: {
        loopKey({ property, uuid }) {
            return `${uuid}${property}`;
        },
    },
};
</script>
