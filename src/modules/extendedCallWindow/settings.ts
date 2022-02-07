import aipreview from './components/alarmIcons/preview.vue';
import mkpreview from './components/missionKeywords/preview.vue';

import { $m, ModuleSettingFunction } from 'typings/Module';
import {
    AppendableList,
    AppendableListSetting,
    Color,
    Hidden,
    MultiSelect,
    NumberInput,
    PreviewElement,
    Select,
    Text,
    Toggle,
} from 'typings/Setting';
import { InternalVehicle, Vehicle } from 'typings/Vehicle';

export default (async (MODULE_ID: string, LSSM: Vue, $m: $m) => {
    const defaultTailoredTabs = Object.values(
        $m('tailoredTabs.defaultTabs')
    ).map(({ name, vehicleTypes }) => ({
        name,
        vehicleTypes: Object.values(vehicleTypes),
    })) as {
        name: string;
        vehicleTypes: (number | string)[];
    }[];

    const vehicles = LSSM.$t('vehicles') as { [id: number]: InternalVehicle };
    const vehicleCaptions = [] as string[];
    const vehicleIds = [] as string[];
    Object.entries(vehicles).forEach(([id, { caption }]) => {
        vehicleCaptions.push(caption);
        vehicleIds.push(id);
    });

    await LSSM.$store.dispatch('api/registerVehiclesUsage', {
        feature: `${MODULE_ID}_settings`,
    });
    (LSSM.$store.state.api.vehicles as Vehicle[])
        .filter(v => v.vehicle_type_caption)
        .forEach(({ vehicle_type, vehicle_type_caption = '' }) => {
            const caption = `[${vehicles[vehicle_type].caption}] ${vehicle_type_caption}`;
            if (!vehicle_type_caption || vehicleCaptions.includes(caption))
                return;
            vehicleCaptions.push(caption);
            vehicleIds.push(`${vehicle_type}-${vehicle_type_caption}`);
        });

    const { missionIds, missionNames } = await LSSM.$utils.getMissionOptions(
        LSSM,
        MODULE_ID,
        'settings'
    );

    const bootsTrapColors = [
        'success',
        'warning',
        'danger',
        'primary',
        'info',
        'default',
    ];
    const bootsTrapColorLabels = bootsTrapColors.map(color =>
        $m(`settings.vehicleCounterColor.${color}`).toString()
    );

    return {
        generationDate: <Toggle>{
            type: 'toggle',
            default: true,
        },
        yellowBorder: <NumberInput>{
            type: 'number',
            default: 0,
            min: 0,
            max: 48,
            dependsOn: '.generationDate',
        },
        redBorder: <Toggle>{
            type: 'toggle',
            default: false,
            dependsOn: '.generationDate',
        },
        enhancedMissingVehicles: <Toggle>{
            type: 'toggle',
            default: false,
        },
        emvMaxStaff: <Toggle>{
            type: 'toggle',
            default: false,
            dependsOn: '.enhancedMissingVehicles',
        },
        hoverTip: <Toggle>{
            type: 'toggle',
            default: true,
            dependsOn: '.enhancedMissingVehicles',
        },
        patientSummary: <Toggle>{
            type: 'toggle',
            default: true,
        },
        collapsablePatients: <Toggle>{
            type: 'toggle',
            default: false,
        },
        collapsablePatientsMinPatients: <NumberInput>{
            type: 'number',
            default: 7,
            dependsOn: '.collapsablePatients',
        },
        arrCounter: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrCounterAsBadge: <Toggle>{
            type: 'toggle',
            default: false,
            dependsOn: '.arrCounter',
        },
        arrClickHighlight: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrClickHighlightColor: <Color>{
            type: 'color',
            default: '#008000',
            dependsOn: '.arrClickHighlight',
        },
        arrClickHighlightWidth: <NumberInput>{
            type: 'number',
            default: 2,
            dependsOn: '.arrClickHighlight',
        },
        arrCounterResetSelection: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrMatchHighlight: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrTime: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrSpecs: <Toggle>{
            type: 'toggle',
            default: false,
        },
        alarmTime: <Toggle>{
            type: 'toggle',
            default: false,
        },
        stickyHeader: <Toggle>{
            type: 'toggle',
            default: false,
        },
        loadMoreVehiclesInHeader: <Toggle>{
            type: 'toggle',
            default: false,
        },
        hideVehicleList: <Toggle>{
            type: 'toggle',
            default: false,
        },
        centerMap: <Toggle>{
            type: 'toggle',
            default: false,
        },
        stagingAreaSelectedCounter: <Toggle>{
            type: 'toggle',
            default: true,
        },
        vehicleTypeInList: <Toggle>{
            type: 'toggle',
            default: false,
        },
        remainingPatientTime: <Toggle>{
            type: 'toggle',
            default: true,
        },
        vehicleCounter: <Toggle>{
            type: 'toggle',
            default: false,
        },
        vehicleCounterColor: <Select>{
            type: 'select',
            default: 'info',
            values: bootsTrapColors,
            labels: bootsTrapColorLabels,
            dependsOn: '.vehicleCounter',
        },
        playerCounter: <Toggle>{
            type: 'toggle',
            default: false,
        },
        playerCounterColor: <Select>{
            type: 'select',
            default: 'danger',
            values: bootsTrapColors,
            labels: bootsTrapColorLabels,
            dependsOn: '.playerCounter',
        },
        arrSearch: <Toggle>{
            type: 'toggle',
            default: false,
        },
        arrSearchAutoFocus: <Toggle>{
            type: 'toggle',
            default: false,
            dependsOn: '.arrSearch',
        },
        arrSearchDropdown: <Toggle>{
            type: 'toggle',
            default: false,
            dependsOn: '.arrSearch',
            disabled: () => true,
        },
        tailoredTabs: <Omit<AppendableList, 'value' | 'isDisabled'>>{
            type: 'appendable-list',
            default: defaultTailoredTabs,
            listItem: [
                <AppendableListSetting<Text>>{
                    name: 'name',
                    title: $m('settings.tailoredTabs.name'),
                    size: 2,
                    setting: {
                        type: 'text',
                    },
                },
                <AppendableListSetting<MultiSelect>>{
                    name: 'vehicleTypes',
                    title: $m('settings.tailoredTabs.vehicles'),
                    size: 0,
                    setting: {
                        type: 'multiSelect',
                        values: vehicleIds,
                        labels: vehicleCaptions,
                    },
                },
            ],
            defaultItem: {
                name: '',
                vehicleTypes: [],
            },
            orderable: true,
            disableable: true,
        },
        missionKeywords: <Omit<AppendableList, 'value' | 'isDisabled'>>{
            type: 'appendable-list',
            default: [],
            listItem: [
                <AppendableListSetting<Text>>{
                    name: 'keyword',
                    title: $m('settings.missionKeywords.keyword'),
                    size: 2,
                    setting: {
                        type: 'text',
                    },
                },
                <AppendableListSetting<Color>>{
                    name: 'color',
                    title: $m('settings.missionKeywords.color'),
                    size: 2,
                    setting: {
                        type: 'color',
                    },
                },
                <AppendableListSetting<Toggle>>{
                    name: 'autotextcolor',
                    title: $m('settings.missionKeywords.autotextcolor'),
                    size: 2,
                    setting: {
                        type: 'toggle',
                    },
                },
                <AppendableListSetting<Color>>{
                    name: 'textcolor',
                    title: $m('settings.missionKeywords.textcolor'),
                    size: 1,
                    setting: {
                        type: 'color',
                    },
                },
                <PreviewElement>{
                    type: 'preview',
                    component: mkpreview,
                    title: $m('settings.missionKeywords.preview'),
                    size: 1,
                },
                <AppendableListSetting<Toggle>>{
                    name: 'prefix',
                    title: $m('settings.missionKeywords.prepend'),
                    size: 2,
                    setting: {
                        type: 'toggle',
                    },
                },
                <AppendableListSetting<MultiSelect>>{
                    name: 'missions',
                    title: $m('settings.missionKeywords.missions'),
                    size: 0,
                    setting: {
                        type: 'multiSelect',
                        values: [-1, ...missionIds],
                        labels: [
                            $m('settings.missionKeywords.allMissions'),
                            ...missionNames,
                        ],
                    },
                },
            ],
            defaultItem: {
                keyword: '',
                color: '#777777',
                autotextcolor: true,
                textcolor: '#ffffff',
                prefix: false,
                missions: [],
            },
            orderable: true,
            disableable: false,
        },
        alarmIcons: <Omit<AppendableList, 'value' | 'isDisabled'>>{
            type: 'appendable-list',
            default: [],
            listItem: [
                <AppendableListSetting<Text>>{
                    name: 'icon',
                    title: $m('settings.alarmIcons.icon'),
                    size: 2,
                    setting: {
                        type: 'text',
                    },
                },
                <AppendableListSetting<Select>>{
                    name: 'type',
                    title: $m('settings.alarmIcons.style'),
                    size: 2,
                    setting: {
                        type: 'select',
                        values: ['fas', 'far', 'fab'],
                        labels: ['solid', 'regular', 'brand'],
                    },
                },
                <PreviewElement>{
                    type: 'preview',
                    component: aipreview,
                    title: $m('settings.alarmIcons.preview'),
                    size: 1,
                },
                <AppendableListSetting<MultiSelect>>{
                    name: 'vehicleTypes',
                    title: $m('settings.alarmIcons.vehicles'),
                    size: 0,
                    setting: {
                        type: 'multiSelect',
                        values: vehicleIds,
                        labels: vehicleCaptions,
                    },
                },
            ],
            defaultItem: {
                icon: '',
                type: 'fas',
                vehicleTypes: [],
            },
            orderable: true,
            disableable: false,
        },
        overlay: <Hidden>{
            type: 'hidden',
            default: false,
        },
        minified: <Hidden>{
            type: 'hidden',
            default: false,
        },
        textMode: <Hidden>{
            type: 'hidden',
            default: false,
        },
        pushRight: <Hidden>{
            type: 'hidden',
            default: false,
        },
        drag: <Hidden<unknown>>{
            type: 'hidden',
            default: {
                active: false,
                top: 60,
                left: window.innerWidth * 0.03,
                offset: {
                    x: 0,
                    y: 0,
                },
            },
        },
    };
}) as ModuleSettingFunction;
