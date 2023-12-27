import { Store } from 'vuex';

export interface State {}

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$store: Store<State>;
	}
}
