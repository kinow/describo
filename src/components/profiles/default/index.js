export default {
    metadata: {
        // can other profiles be joined in to this one?
        extensible: true
    },
    RootDatasets: {
        // You can define as many root datasets as you like. If there's more
        //  than one a selector will be shown.
        Dataset: {
            metadata: {
                about:
                    "Some pithy text about what this is and why the user should select it"
            },
            inputs: [
                {
                    // If you want to add a property with a specific value
                    //  set @type = "value"
                    //  and specify the value
                    property: "additionalType",
                    label: "Additional Type",
                    "@type": "Value",
                    value: "item"
                },
                {
                    // the schema element to write this data against
                    property: "name",

                    // the label to display - otherwise the last element of property is shown
                    label: "Name",

                    // the type of element: one of the core types in components/CrateCreator/components
                    "@type": "Text",

                    // whether this element is required - used by strict
                    required: true
                },
                {
                    property: "datePublished",
                    label: "Date Published (your local date)",

                    // the type of element: one of the core types in components/CrateCreator/components
                    "@type": "Date"
                },
                {
                    property: "author",
                    label: "Author",

                    // the type of element: one of the core types in components/CrateCreator/components
                    "@type": ["Person", "Organisation"],

                    // can there be multiple authors?
                    multiple: true
                },
                {
                    property: "participant",
                    label: "Participant",

                    // the type of element: one of the core types in components/CrateCreator/components
                    "@type": ["Person", "Organisation"],

                    // can there be multiple authors?
                    multiple: true
                }
                // {
                //     property: "hasPart",
                //     label: "Part",
                //     "@type": "Part",
                //     multiple: true
                // }
            ]
        },
        Collection: {
            metadata: {
                about:
                    "Some pithy text about what this is and why the LINGUIST user should select it"
            },
            inputs: [
                {
                    property: "additionalType",
                    label: "Additional Type",
                    "@type": "Value",
                    value: "item"
                },
                {
                    property: "name",
                    label: "Name",
                    "@type": "Text",
                    required: true
                }
            ]
        }
    }
};