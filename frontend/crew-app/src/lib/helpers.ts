import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export async function authenticateUser(): Promise<{
	isAuthenticated: boolean;
	access_token?: string;
}> {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('Not authorized');
	}

	const access_token = session.access_token;
	if (!access_token) throw new Error('No access token returned');
	if (access_token) {
		return { isAuthenticated: true, access_token };
	} else {
		return { isAuthenticated: false };
	}
}

export function setupRealtimeSubscription(
	dbTable: string,
	handleRealtimeChange: (payload: any) => void,
): RealtimeChannel {
	//let realtimeChannel: RealtimeChannel | null = null;
	const realtimeChannel = supabase
		.channel(dbTable)
		.on(
			'postgres_changes',
			{
				event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
				schema: 'public',
				table: dbTable,
			},
			(payload) => {
				console.log('Realtime change received:', payload);
				handleRealtimeChange(payload);
			},
		)
		.subscribe((status) => {
			if (status === 'SUBSCRIBED') {
				console.log(`Subscribed to ${dbTable} changes`);
			}
			if (status === 'CHANNEL_ERROR') {
				console.error('Realtime subscription error');
			}
		});
	return realtimeChannel;
}
