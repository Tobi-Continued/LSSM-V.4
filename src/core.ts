import Vue from 'vue';
import VueJSModal from 'vue-js-modal';
import ToggleButton from 'vue-js-toggle-button';
import * as Tabs from 'vue-slim-tabs';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LSSMV4 from './LSSMV4.vue';
import LSSMMenu from './LSSM-Menu.vue';
import store from './store';
import i18n from './i18n';
import utils from './utils';
import browserTitle from './natives/browserTitle';
import telemetry from './modules/telemetry/main';
import releasenotes from './modules/releasenotes/main';
import { RadioMessage } from '../typings/helpers';

require('./natives/navTabsClicker');

Vue.config.productionTip = false;

const appContainer = document.createElement('div') as HTMLDivElement;
document.body.appendChild(appContainer);

window.keepAlive = true;

utils(Vue);
Vue.use(VueJSModal, {
    dynamic: true,
    dynamicDefaults: {
        adaptive: true,
        scrollable: true,
        clickToClose: true,
    },
    dialog: true,
});
Vue.use(ToggleButton);
Vue.use(Tabs);

Vue.component('font-awesome-icon', FontAwesomeIcon);

window[PREFIX] = new Vue({
    store: store(Vue),
    i18n: i18n(Vue),
    render: h => h(LSSMV4),
}).$mount(appContainer);

console.log('Und der LSSM wurde einmal gemounted :)');

export const LSSM = window[PREFIX] as Vue;

browserTitle(LSSM);

if (window.location.pathname === '/') {
    window.console.info(
        `Running %cLSSM%c in Version %c${VERSION}%c`,
        'font-weight: bold;',
        'font-weight: normal;',
        'font-style: italic;'
    );

    const indicatorWrapper = document.createElement('li') as HTMLLIElement;
    document
        .querySelector('.navbar-default .navbar-right')
        ?.appendChild(indicatorWrapper);

    LSSM.$store
        .dispatch('settings/register', {
            moduleId: 'global',
            settings: {
                labelInMenu: {
                    type: 'toggle',
                    default: false,
                },
            },
        })
        .then(() => {
            new LSSM.$vue({
                store: LSSM.$store,
                i18n: LSSM.$i18n,
                render: h => h(LSSMMenu),
            }).$mount(indicatorWrapper);
        });
}

(async () => {
    if (window.location.pathname.match(/^\/users\//)) return;
    LSSM.$store.commit(
        'api/setVehicleStates',
        await LSSM.$store
            .dispatch('api/request', { url: '/api/vehicle_states' })
            .then(res => res.json())
    );
    if (window.location.pathname === '/') {
        telemetry(LSSM);
        releasenotes(LSSM);
        // TODO: Load core modules: [support] ← Will be done in a more efficient way than polling

        await LSSM.$store.dispatch('hook', {
            event: 'radioMessage',
            post: false,
            callback({ fms, fms_real, id, user_id, caption }: RadioMessage) {
                if (user_id === window.user_id)
                    LSSM.$store.commit('api/setVehicleState', {
                        fms,
                        fms_real,
                        id,
                        caption,
                    });
            },
        });
    }
    LSSM.$store
        .dispatch('storage/get', {
            key: 'activeModules',
            defaultValue: [],
        })
        .then((activeModules: string[]) => {
            if (LSSM.$store.state.mapkit)
                activeModules = activeModules.filter(
                    module => !LSSM.$store.state.modules[module].noMapkit
                );
            activeModules.forEach(module => {
                LSSM.$store.commit('setModuleActive', module);
                if (
                    window.location.pathname.match(
                        LSSM.$store.state.modules[module].location
                    )
                )
                    LSSM.$store.dispatch('loadModule', module);
            });
        });
})();
