import { request } from '@common/request';
import { getInterfaceData } from '@/config';

export function testReq(any: any) {
	return request.Get({
		url: getInterfaceData('test', 'test'),
	});
}
