import type {App} from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import colors from './colors';
import {definePreset} from '@primeuix/themes';


const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                ...colors
            }
        }
    },
    components: {
        toggleswitch: {
            root: {
                width: '29px',
                height: '19px'
            },
            css: ({dt}) => `
                .p-toggleswitch-slider{
                    background: ${dt('surface.800')};
                }
                .p-toggleswitch-handle{
                    inset-inline-start: unset !important;
                    }
                .p-toggleswitch-handle[data-p="checked"]{
                    left:1px
                 }
                .p-toggleswitch-handle[data-p="disabled"]{
                    background: ${dt('white')} !important
                 }
                .p-toggleswitch-handle[data-p="checked disabled"]{
                    background: ${dt('white')} !important;
                    left:1px;
                 }
            `
        },
        radiobutton: {
            root: {
                width: '1rem',
                height: '1rem',
                borderColor: '{surface.700}'
            },
            css: ({dt}) => `
                .p-radiobutton {
                    width: 1rem !important;
                    height: 1rem !important;
                }
                .p-radiobutton-icon[data-p="checked"] {
                    background: ${dt('primary.500')};
                    transform:scale(.4) !important;
                }
            `
        },
        // card: {
        //     root: {
        //         borderRadius: '.5rem',
        //         color: '{neutral.900}',
        //         shadow: ''
        //     },
        //     body: {
        //         padding: '1rem',
        //         gap: '1rem'
        //     },
        //     css: () => `
        //         @media (min-width: ${breakpoints.md}px) {
        //         .p-card .p-card-body {
        //             padding:1.5rem !important;
        //         }
        //         }
        //     `
        // },
        button: {
            colorScheme: {
                light: {
                    outlined: {
                        primary: {
                            hoverBackground: '{primary.100}',
                            borderColor: '{primary.500}'
                        }
                    },
                    root: {
                        borderRadius: '0.5rem',
                        gap: '0.25rem',
                        paddingX: '1rem',
                        paddingY: '1px',
                        primary: {
                            background: '{primary.800}',
                        },
                        secondary: {
                            background: '{neutral.100}',
                            hoverBackground: '{neutral.100}',
                            hoverBorderColor: 'transparent',
                            color: '{neutral.900}',
                            hoverColor: '{neutral.900}',
                            activeBackground: '{neutral.100}',
                            activeBorderColor: 'transparent',
                            borderColor: 'transparent',
                            focusRing: {
                                color: '{neutral.900}',
                                shadow: '0'
                            }
                        },
                        help: {
                            background: '{primary.100}',
                            borderColor: 'transparent',
                            color: '{primary.500}',
                            hoverBackground: '{primary.500}',
                            hoverBorderColor: 'transparent',
                            hoverColor: '{white}',
                            activeColor: '{white}',
                            activeBackground: '{primary.500}',
                            activeBorderColor: 'transparent',
                            focusRing: {
                                color: '{primary.500}',
                                shadow: '0'
                            }
                        },
                        sm: {
                            paddingX: '0.5rem',
                            paddingY: '0.4375rem'
                        },
                        lg: {
                            paddingX: '0.75rem',
                            paddingY: '.75rem'
                        }
                    },
                    text: {
                        secondary: {
                            color: '{neutral.900}',
                            hoverBackground: 'transparent',
                            activeBackground: 'transparent'
                        },
                        help: {
                            color: '{primary.500}',
                            hoverBackground: '{primary.100}',
                            activeBackground: '{white}'
                        },
                        danger: {
                            color: '{error.500}',
                            hoverBackground: '{error.50}',
                            activeBackground: '{transparent}'
                        },
                        warn: {
                            color: '{warning.100}',
                            hoverBackground: '{warning.50}',
                            activeBackground: '{transparent}'
                        },
                        info: {
                            color: '{info.600}',
                            hoverBackground: '{transparent}',
                            activeBackground: '{transparent}'
                        },
                        success: {
                            color: '{success.500}',
                            hoverBackground: '{transparent}',
                            activeBackground: '{transparent}'
                        }
                    }
                }
            },
            css: ({dt}) => `
            .p-button {
                height: 42px;
                box-sizing: border-box;
            }
            .p-button-text:disabled{
                color :${dt('neutral.600')};
            }
            .p-button-help.p-button-text svg {
                transform: translateX(0px);
                transition: all .3s ease; 
                color: ${dt('button.help.color')}
            }
            .p-button-help.p-button-text:hover svg {
                transform: translateX(-4px);
            }
            .p-button-primary.p-button-outlined:hover {
                border-color: transparent;
            }
            .p-button:not(.p-button-outlined,.p-button-text):disabled {
                opacity: 1;
                border: none;
                background: ${dt('neutral.200')};
                color: ${dt('neutral.600')};
            }
            .p-button-outlined:disabled {
                opacity: 1;
                color: ${dt('neutral.600')};
                border-color: ${dt('neutral.600')};
            }
            .p-button-outlined:not(:disabled):hover {
                border-color: ${dt('primary.100')};
            }
            .p-button-label {
                font-size: .875rem;
                line-height: 28px;
            }
            .p-button-link {
                border-bottom-left-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
                padding: 0;
                height: auto !important;
            }
            .p-button-link:hover{
                border-bottom: 1px solid ${dt('primary.500')} !important;
            }
            `
        },
        ripple: {
            root: {
                background: '{primary.500}'
            }
        },
        dialog: {
            header: {
                padding: '20px 20px 0'
            },
            title: {
                fontSize: '.875rem',
                fontWeight: '700'
            },
            css: ({dt}) => `
            .p-dialog {
                max-height: 100%;
            }
            .p-dialog-title {
                color: ${dt('secondary-800')}
            }
            `
        },
        message: {
            simple: {
                content: {
                    padding: '.25rem'
                }
            },
            text: {
                fontWeight: '400',
                sm: {
                    fontSize: '.75rem'
                }
            },
            colorScheme: {
                light: {
                    error: {
                        color: '{error.500}',
                        background: '{error.50}',
                        borderColor: 'transparent'
                    },
                    warn: {
                        color: '{warning.100}',
                        background: '{warning.600}',
                        borderColor: 'transparent'
                    },
                    info: {
                        color: '{info.600}',
                        background: '{primary.100}',
                        borderColor: 'transparent'
                    },
                    success: {
                        color: '{success.500}',
                        background: '{success.50}',
                        borderColor: 'transparent'
                    }
                }
            }
        },
        badge: {
            colorScheme: {
                light: {
                    secondary: {
                        color: '{neutral.600}',
                        background: '{neutral.100}'
                    },
                    success: {
                        color: '{success.500}',
                        background: '{success.50}'
                    },
                    danger: {
                        color: '{error.500}',
                        background: '{error.50}'
                    },
                    warn: {
                        color: '{warning.100}',
                        background: '{warning.600}'
                    }
                }
            },
            root: {
                fontSize: '12px',
                padding: '2px 8px',
                fontWeight: '500',
                borderRadius: '4px'
            },
            css: () => `
            .badge-sm {
                padding: 0 4px !important;
            }

            .badge-lg {
                padding: 2px 8px !important;
            }
            `
        },
        tabs: {
            activeBar: {
                height: '2px'
            },
            tablist: {
                borderColor: '{neutral.100}'
            },
            tabpanel: {
                padding: '0'
            },
            tab: {
                padding: '0 0 .5rem',
                fontWeight: '500',
                color: '{surface.900}',
                borderColor: '{neutral.100}'
            },
            css: ({dt}) => `
            .p-tab {
                font-size: 14px;
                line-height: 200%;
                border-bottom-width : 2px;
            }
            .p-tab:not(.p-tab-active):not(.p-disabled) {
                font-weight: normal !important;
            }
            .p-tab:not(.p-tab-active):not(.p-disabled):hover {
                border-color: ${dt('{primary.600}')} !important;
                color: ${dt('{primary.600}')} !important;
                font-weight: normal !important;
            }
            `
        },
        menubar: {
            root: {
                borderColor: 'transparent',
                padding: '0',
                gap: '2rem',
                color: '{surface.900}'
            },
            baseItem: {
                padding: '4px 0'
            },
            submenu: {
                background: '{white}',
                borderColor: 'transparent',
                shadow: '0 .25rem 1.5rem rgba(51, 51, 204, 0.08)',
                padding: '0'
            },
            item: {
                activeBackground: 'transparent',
                borderRadius: '0',
                focusBackground: 'transparent',
                activeColor: '{surface.900}',
                focusColor: '{surface.900}',
                color: '{surface.500}',
                gap: '0',
                padding: '.75rem 1rem'
            },
            css: () => `
            .p-menubar-submenu {
                margin-top: 1rem;
                min-width: 175px;
            }
            `
        },
        menu: {
            list: {
                padding: '0'
            },
            extend: {
                marginTop: '12px'
            },
            item: {
                focusBackground: '{neutral.50}',
                color: '{neutral.900}',
                focusColor: '{neutral.900}',
                padding: '.75rem 1rem'
            }
        },
        password: {
            css: () => `
        .p-password,
        .p-password-input {
            width: 100%;
        }
    `
        },
        inputtext: {
            root: {
                filledBackground: '{neutral.50}',
                filledFocusBackground: '{neutral.50}',
                filledHoverBackground: '{neutral.50}',
                placeholderColor: '{surface.700}',
                color: '{neutral.900}',
                borderColor: '{surface.600}',
                hoverBorderColor: '{surface.600}',
                borderRadius: '.5rem',
                paddingY: '.5rem',
                invalidBorderColor: '{error.600}',
                disabledBackground: '{neutral.100}',
                shadow: 'none'
            },
            css: ({dt}) => `
            .p-inputtext,.p-inputtext::placeholder {
                font-size: 12px;
                font-weight:400;
                line-height: 24px;
            }
            .p-inputtext.p-invalid::placeholder {
                color: ${dt('{surface.700}')}
            }    
            `
        },
        datatable: {
            headerCell: {
                padding: '.5rem 1.25rem',
                borderColor: '{neutral.100}',
                background: '{neutral.50}',
                color: '{neutral.900}',
                hoverBackground: '{neutral.50}',
                hoverColor: '{neutral.900}',
                selectedBackground: '{neutral.50}',
                selectedColor: '{neutral.900}'
            },
            row: {
                background: '{white}',
                color: '{black}',
                hoverColor: '{black}',
                hoverBackground: '{neutral.50}'
            },
            columnTitle: {
                fontWeight: '500'
            },
            bodyCell: {
                padding: '.25rem 1.25rem'
            },
            css: ({dt}) => `
            .p-datatable-table {
                border: 1px solid;
                border-color: ${dt('{surface.600}')};
                border-radius: 8px;
                min-width: 100%;
                white-space: nowrap;
                width: max-content;
                border-collapse: separate;
            }
            .p-datatable-header-cell:first-child {
                border-radius: 0 8px 0 0;
            }
            .p-datatable-header-cell:last-child {
                border-radius: 8px 0 0 0;
            }
            .p-datatable-tbody > tr {
                cursor: pointer;
                height: 72px;
            }
            .p-datatable-tbody > tr:last-child > td {
                border-width: 0; 
            }
            .p-datatable-tbody > tr:last-child > td:last-child {
                border-radius: 0 0 0 8px;
            }
            .p-datatable-tbody > tr:last-child > td:first-child {
                border-radius: 0 0 8px 0;
            }
            .p-datatable-column-title {
                font-size: 14px;
                line-height: 200%;
            }
            .p-datatable-table .p-badge {
                display: none;
            }
            `
        },
        galleria: {
            indicatorList: {
                padding: '0'
            },
            indicatorButton: {
                height: '3px',
                width: '9px',
                borderRadius: '1px',
                activeBackground: '{white}'
            },
            css: () => `
            .p-galleria-indicator-list {
                position: absolute;
                bottom: .5rem;
                left: 0;
                right: 0;
            }
            .p-galleria-indicator-active .p-galleria-indicator-button {
                width: 18px;
            }
            `
        },
        popover: {
            root: {
                color: 'inherit'
            },
            content: {
                padding: ''
            },
            css: () => `
            .p-popover:before, .p-popover:after {
                display: none;
            }`
        },
        drawer: {
            header: {
                padding: ''
            },
            content: {
                padding: ''
            },
            css: () => `
            .p-drawer-bottom .p-drawer {
                height: fit-content;
            }
            .p-drawer-right .p-drawer {
                width: fit-content;
            }    
            `
        },
        panelmenu: {
            root: {
                gap: ''
            },
            item: {
                focusBackground: ''
            },
            panel: {
                first: {
                    borderWidth: '0'
                },
                last: {
                    borderWidth: '0'
                },
                padding: '',
                borderWidth: '0'
            },
            css: ({dt}) => `
            .p-panelmenu-submenu {
                margin-top: 1.5rem;
                border-right: 2px solid ${dt('button.help.color')};
            }
            .p-panelmenu a {
                 margin-top: 1.25rem;
                display: flex;
            }
            `
        },
        breadcrumb: {
            root: {
                padding: '',
                background: 'transparent'
            },
            separator: {
                color: '{neutral.500}'
            }
        },
        checkbox: {
            css: ({dt}) => `
            .p-checkbox:not(.p-checkbox-checked) .p-checkbox-box {
                border: 1px solid ${dt('{surface.700}')} !important;
            }
            .p-checkbox.p-disabled:not(.p-checkbox-checked) .p-checkbox-box {
                background: ${dt('{surface.600}')};
                border: 1px solid ${dt('{neutral.100}')} !important;
            }
            .p-checkbox-checked .p-checkbox-box{
                border:none;
            }
            .p-checkbox-checked.p-disabled .p-checkbox-box{
               background: ${dt('{surface.600}')};
            }
            .p-checkbox-box svg{
                width:9px;
                height:8px;
            }
            .p-checkbox:not(.p-checkbox-checked) svg{
                display:none;
            }    
            .p-checkbox-checked:not(.p-disabled) .p-checkbox-box svg{
                color: white !important;
            }
            .p-checkbox-checked.p-disabled .p-checkbox-box svg{
                color: ${dt('{neutral.700}')} !important;
            }
            `
        },
        tag: {
            colorScheme: {
                light: {
                    secondary: {
                        color: '{neutral.600}',
                        background: '{neutral.100}'
                    },
                    success: {
                        color: '{success.500}',
                        background: '{success.50}'
                    },
                    warn: {
                        color: '{warning.300}',
                        background: '{warning.50}'
                    },
                    contrast: {
                        color: '{neutral.600}',
                        background: '{neutral.100}'
                    }
                }
            },
            root: {
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '4px',
                padding: '0 4px'
            },
            css: () => `
            .p-tag {
                line-height: 24px;
            }
            `
        },
        paginator: {
            root: {
                borderRadius: '.5rem',
                gap: '1rem'
            },
            navButton: {
                background: 'transparent',
                color: '{neutral.500}',
                height: '1.5rem',
                width: '24px',
                borderRadius: '.25rem',
                hoverColor: '{primary.500}'
            },
            css: () => `
            .p-paginator-page {
            font-size: 12px;
            }
            `
        },
        select: {
            root: {
                placeholderColor: '{surface.500}',
                borderRadius: '.5rem'
            },
            list: {
                padding: '0'
            },
            option: {
                focusBackground: 'transparent',
                color: '{surface.500}',
                padding: '8px 12px 8px 0',
                focusColor: 'inherit',
                selectedBackground: 'transparent',
                selectedColor: '{surface.500}',
                selectedFocusBackground: 'transparent',
                selectedFocusColor: '{primary.600}'
            },
            css: ({dt}) => `
                .p-select-label {
                    color: ${dt('surface.500')};
                    font-size: 14px;
                    line-height: 28px;
                    font-weight : 400;
                }
                .p-select-option{
                    font-weight : 500;
                    font-size: 14px;
                    line-height: 28px;
                }
            `
        },
        textarea: {
            root: {
                filledBackground: '{neutral.50}',
                filledFocusBackground: '{neutral.50}',
                filledHoverBackground: '{neutral.50}',
                placeholderColor: '{neutral.500}',
                color: '{neutral.900}',
                borderColor: '{surface.600}',
                hoverBorderColor: '{surface.600}',
                borderRadius: '.5rem',
                paddingY: '.5rem',
                invalidBorderColor: '{error.600}'
            },
            css: () => `
            .p-textarea {
                font-size: 14px;
                line-height: 24px;
            }`
        },
        tooltip: {
            colorScheme: {
                light: {
                    root: {
                        background: '{primary.900}',
                        color: '{white}'
                    }
                }
            },
            css: ({dt}) => `
                .p-tooltip {
                    white-space: normal;
                    max-width : 290px;
                }
                .p-tooltip-text {
                    color: ${dt('tooltip.root.color')};
                }
                .p-tooltip ul {
                    list-style-type: disc;
                    padding-right: 10px;
                },
            `
        }
    }
});

export default {
    install: (app: App) => {
        app.use(PrimeVue, {
            ripple: true,
            theme: {
                preset: MyPreset,
                options: {
                    prefix: 'is',
                    darkModeSelector: false,
                    cssLayer: false
                }
            }
        });
    }
};
