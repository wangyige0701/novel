import type { Fn } from '@wang-yige/utils';

type PathParams = Record<string, string | number | boolean>;

type PathNavigateBack = UniApp.NavigateBackOptions;

type PathNavigateTo = Omit<UniApp.NavigateToOptions, 'url'> & { params: PathParams };

type PathRedirectTo = Omit<UniApp.RedirectToOptions, 'url'> & { params: PathParams };

type PathReLaunch = Omit<UniApp.ReLaunchOptions, 'url'> & { params: PathParams };

type PathOptions = Record<string, any> & {
	success?: Fn<[any]>;
	fail?: Fn<[any]>;
};
