<template>
	<template v-if="isLoading">Loading...</template>
	<div
		v-else
		class="flex flex-col items-center gap-6 mt-8 mb-6">
		<h1>Alert Settings</h1>

		<div class="flex flex-col gap-4">
			<!-- description -->
			<div style="display: block">
				<label
					for="description"
					class="mr-2"
					>Description:
				</label>
				<input
					type="text"
					id="description"
					v-model="form.description"
					required />
			</div>

			<!-- alert type - multiple select -->
			<div class="flex flex-col gap-1">
				<label for="alertType">Alert type: </label>
				<label>
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="temperature" />Temperature</label
				>
				<label>
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="delay" />Delivery delay</label
				>
				<label>
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="speed" />Speed</label
				>
				<label>
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="out of range" />Out of range</label
				>
			</div>

			<!-- Conditional inputs -->
			<div
				v-if="form.alertType === 'temperature'"
				class="flex flex-col">
				<label>
					Min Temperature:
					<input
						class="ml-2"
						type="number"
						v-model.number="form.tempMin" />
				</label>
				<label>
					Max Temperature:
					<input
						class="ml-2"
						type="number"
						v-model.number="form.tempMax" />
				</label>
			</div>

			<div v-else-if="form.alertType === 'delay'">
				<label>
					Delay Minutes:
					<input
						class="ml-2"
						type="number"
						v-model.number="form.delayMinutes" />
				</label>
			</div>

			<!-- tracking - dropdown with vehicles, bookings,... -->
			<div>
				<label
					for="tracking"
					disabled
					>Track by:
				</label>
				<select
					id="tracking"
					v-model="form.tracking"
					class="ml-2"
					@change="() => getVehicles()">
					<option
						value="placeholder"
						selected
						disabled>
						-- Select an option --
					</option>
					<option value="vehicles">Vehicles</option>
					<!-- opens a new list of all vehicles to select one or more -->
					<option
						value="bookings"
						disabled>
						bookings
					</option>
					<option
						value="drivers"
						disabled>
						drivers
					</option>
					<option
						value="customers"
						disabled>
						customers
					</option>
					<option
						value="locations"
						disabled>
						locations
					</option>
				</select>
			</div>

			<!-- Dynamic dropdown for the fetched list (vehicles atm) -->
			<div v-if="vehiclesList.length > 0">
				<label :for="form.tracking + '-list'"> Select {{ form.tracking }}: </label>
				<select
					:id="form.tracking + '-list'"
					v-model="form.selectedTrackingItems"
					required
					multiple
					class="ml-2">
					<option
						v-for="opt in vehiclesList"
						:key="opt.id"
						:value="opt.id">
						{{ opt.registration }}
					</option>
				</select>
			</div>

			<!-- Date ranges -->
			<div class="space-y-2">
				<label>Date ranges:</label>
				<div
					v-for="(range, index) in form.dateRanges"
					:key="index"
					class="space-x-2">
					From:
					<input
						type="date"
						:min="today"
						v-model="range.from"
						required />
					To:
					<input
						type="date"
						:min="today"
						v-model="range.to"
						required />
					<button
						v-if="form.dateRanges.length > 1"
						type="button"
						@click="removeDateRange(index)">
						Remove
					</button>
				</div>
				<button
					type="button"
					@click="addDateRange">
					+ Add more dates
				</button>
			</div>

			<!-- Active hours -->
			<div class="space-y-2">
				<label>Active alert hours:</label>
				<div
					v-for="(hours, index) in form.activeHours"
					:key="index"
					class="space-x-2">
					From:
					<input
						type="time"
						v-model="hours.from"
						step="3600"
						required />
					To:
					<input
						type="time"
						v-model="hours.to"
						step="3600"
						required />
					<button
						class="ml-2"
						v-if="form.activeHours.length > 1"
						type="button"
						@click="removeActiveHours(index)">
						Remove
					</button>
				</div>
				<button
					type="button"
					@click="addActiveHours">
					+ Add more hours
				</button>
			</div>

			<!-- interval in minutes -->
			<div style="display: block; margin-top: 1rem">
				<label>Interval range: </label>
				<input
					class="ml-2"
					type="number"
					min="1"
					v-model="form.interval"
					required />
			</div>

			<!-- Receivers - create new or choose from existing -->
			<div class="space-x-4">
				<label>
					<input
						type="radio"
						value="create"
						v-model="form.receiverOption" />
					Create receiver
				</label>
				<label>
					<input
						type="radio"
						value="choose"
						v-model="form.receiverOption" />
					Choose receiver
				</label>
			</div>

			<div v-if="form.receiverOption === 'create'">
				<!-- Receiver input form -->
				<div class="receiver-form">
					<label>
						Name:
						<input
							type="text"
							v-model="newReceiver.receiverName"
							required
							focus />
					</label>

					<div class="contact-method">
						<span>Contact by:</span>
						<label>
							<input
								type="checkbox"
								v-model="newReceiver.contactSms" />
							SMS
						</label>
						<label>
							<input
								type="checkbox"
								v-model="newReceiver.contactEmail" />
							Email
						</label>
					</div>

					<div v-if="newReceiver.contactSms">
						<input
							type="tel"
							v-model="newReceiver.phoneNumber"
							placeholder="Enter phone number"
							required />
					</div>

					<div v-if="newReceiver.contactEmail">
						<input
							type="email"
							v-model="newReceiver.email"
							placeholder="Enter email"
							required />
					</div>

					<button
						type="button"
						class="btn btn-add mt-5"
						@click="addReceiver">
						Add Receiver
					</button>
				</div>
			</div>

			<div v-if="form.receiverOption === 'choose'">
				<div>
					<button
						:class="['tab', mode === 'drivers' ? 'active' : '']"
						@click="
							{
								mode = 'drivers';
								getDrivers();
							}
						">
						Drivers
					</button>
					<button
						:class="['tab', mode === 'customers' ? 'active' : '']"
						@click="
							{
								mode = 'customers';
								getCustomers();
							}
						">
						Customers
					</button>
				</div>

				<div v-if="mode === 'drivers'">
					<h4 class="mt-3 mb-3">Drivers</h4>
					<div
						v-for="d in drivers"
						:key="d.id"
						class="list-row">
						<details class="details">
							<summary>{{ d.displayName }} contacts</summary>
							<div class="contact-options">
								<label v-if="d.phoneNumber">
									<input
										type="checkbox"
										:disabled="!d.phoneNumber"
										:checked="selections[`drv-${d.id}`]?.contactSms || false"
										@change="
											(e) =>
												ensureSelection(d, 'contactSms', (e.target as HTMLInputElement).checked, {
													origin: 'driver',
													keyPrefix: 'drv',
												})
										" />
									Phone: {{ d.phoneNumber }}
								</label>
								<label v-if="d.email">
									<input
										type="checkbox"
										:disabled="!d.email"
										:checked="selections[`drv-${d.id}`]?.contactEmail || false"
										@change="
											(e) =>
												ensureSelection(d, 'contactEmail', (e.target as HTMLInputElement).checked, {
													origin: 'driver',
													keyPrefix: 'drv',
												})
										" />
									Email: {{ d.email }}
								</label>
								<div v-if="!d.phoneNumber && !d.email">No contact info available</div>
							</div>
						</details>
					</div>
				</div>
				<div v-if="mode === 'drivers'">
					<button
						type="button"
						class="btn btn-add mt-5"
						@click="addSelectedDrivers">
						Add selected to list
					</button>
				</div>

				<!-- customers part-->
				<div
					v-if="mode === 'customers'"
					class="space-y-4">
					<h4 class="mt-3 mb-3">Customers</h4>
					<div
						v-for="c in customers"
						:key="c.id"
						class="list-row">
						<details @click="getCustomerLocations(c.id)">
							<summary class="cust-summary">
								{{ c.name }}
							</summary>
							<div v-if="loadingLocations[c.id]">Loading locations...</div>

							<ul v-else-if="customerLocations[c.id]">
								<li
									v-for="loc in customerLocations[c.id]"
									:key="loc.id"
									style="list-style: none">
									<details>
										<summary>{{ loc.name }} ({{ loc.contactPerson }})</summary>

										<div class="contact-options">
											<label v-if="loc.phoneNumber">
												<input
													type="checkbox"
													:checked="selections[`loc-${loc.id}`]?.contactSms || false"
													@change="
														(e) =>
															ensureSelection(loc, 'contactSms', (e.target as HTMLInputElement).checked, {
																origin: 'customer',
																keyPrefix: 'loc',
															})
													" />
												Phone:
												{{ loc.phoneNumber }}
											</label>

											<label v-if="loc.email">
												<input
													type="checkbox"
													:checked="selections[`loc-${loc.id}`]?.contactEmail || false"
													@change="
														(e) =>
															ensureSelection(loc, 'contactEmail', (e.target as HTMLInputElement).checked, {
																origin: 'customer',
																keyPrefix: 'loc',
															})
													" />
												Email:
												{{ loc.email }}
											</label>

											<div v-if="!loc.phoneNumber && !loc.email">No contact info</div>
										</div>
									</details>
								</li>
							</ul>
							<div v-else>No locations found.</div>
						</details>
					</div>
					<button
						type="button"
						class="btn btn-add mt-5"
						@click="addSelectedCustomerLocations">
						Add selected locations
					</button>
				</div>
			</div>

			<!-- List of saved receivers -->
			<div
				v-if="form.receivers.length"
				class="receiver-list">
				<div
					v-for="(receiver, i) in form.receivers"
					:key="i"
					class="receiver-item">
					<div
						v-if="editingIndex !== i"
						class="flex flex-col gap-3">
						<strong>{{ receiver.receiverName }}</strong>
						<div v-if="receiver.contactSms">📱 {{ receiver.phoneNumber }}</div>
						<div v-if="receiver.contactEmail">✉️ {{ receiver.email }}</div>
						<div class="space-x-3">
							<button
								type="button"
								class="btn btn-edit"
								@click="editReceiver(i)">
								Edit
							</button>
							<button
								type="button"
								class="btn btn-delete"
								@click="removeReceiver(i)">
								Delete
							</button>
						</div>
					</div>

					<div
						v-else
						class="edit-form">
						<label>
							Name:
							<input
								required
								type="text"
								v-model="editForm.receiverName"
								class="ml-1" />
						</label>

						<label>
							Phone:
							<input
								type="tel"
								v-model="editForm.phoneNumber" />
							<input
								class="ml-1"
								type="checkbox"
								v-model="editForm.contactSms" />
							Use SMS
						</label>

						<label>
							Email:
							<input
								type="email"
								v-model="editForm.email" />
							<input
								class="ml-1"
								type="checkbox"
								v-model="editForm.contactEmail" />
							Use Email
						</label>

						<div class="space-x-3">
							<button
								class="btn btn-add"
								type="button"
								@click="saveEdit">
								Save
							</button>
							<button
								class="btn btn-delete"
								type="button"
								@click="cancelEdit">
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>

			<button
				@click="handleSubmit"
				type="button"
				style="margin-top: 1rem">
				{{ pageMode === 'edit' ? 'Save Changes' : 'Add alert' }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { supabase } from '../supabase';
import type {
	Driver,
	Customer,
	CustomerLocation,
	VehicleInfo,
	Receiver,
	Selection,
} from '../../types';
import { useRoute } from 'vue-router';
import { authenticateUser } from '@/lib/helpers';
import { DeliveryAlertSettingsFormSchema, type DeliveryAlertSettingsForm } from '../data/schema.ts';
import { onBeforeRouteLeave } from 'vue-router';

onBeforeRouteLeave(() => {
	clearCache();
});

const today = new Date().toISOString().split('T')[0];
//Tracks the selected receivers
const selections = reactive<Record<string, Selection>>({});
// Track which receiver is being edited
const editingIndex = ref<number | null>(null);
let drivers = ref<Driver[]>([]);
let customers = ref<Customer[]>([]);
const customerLocations = ref<Record<string, CustomerLocation[]>>({});
const loadingLocations = ref<Record<string, boolean>>({});
let vehiclesList = ref<VehicleInfo[]>([]);
const mode = ref<'drivers' | 'customers'>('drivers');
const route = useRoute();
const pageMode = computed(() => {
	if (route.path.endsWith('/edit')) return 'edit';
	if (route.path.endsWith('/copy')) return 'copy';
	if (route.path.endsWith('/new')) return 'new';
	return 'view';
});
const initialForm = {
	description: '',
	alertType: '', //can be only one
	tracking: 'placeholder',
	selectedTrackingItems: [] as (string | number)[],
	dateRanges: [{ from: '', to: '' }], // start with one
	activeHours: [{ from: '', to: '' }], // start with one
	interval: null,
	receiverOption: null,
	receivers: [] as Receiver[], // start with one, can be multiple
	tempMin: null as number | null,
	tempMax: null as number | null,
	delayMinutes: null as number | null,
};

let form = reactive({ ...initialForm });

const isLoading = ref(false);
const id = route.params.id as string | undefined;

const newReceiver = reactive<Receiver>({
	receiverName: '',
	phoneNumber: '',
	email: '',
	origin: 'custom',
	contactEmail: false,
	contactSms: false,
});

// Temporary edit form (separate from the main list)
const editForm = reactive<Receiver>({
	receiverName: '',
	phoneNumber: '',
	email: '',
	origin: undefined,
	originId: undefined,
	contactSms: false,
	contactEmail: false,
});

onMounted(async () => {
	if ((pageMode.value === 'edit' || pageMode.value === 'copy') && id) {
		// Fetch existing alert setting by ID and populate form
		try {
			const { isAuthenticated, access_token } = await authenticateUser();
			if (!isAuthenticated || !access_token) return;
			isLoading.value = true;
			const response = await fetch(`http://localhost:8080/api/delivery-alert-setting/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
			});
			const data = await response.json();
			console.log('Fetched alert setting data:', data);
			form.description = data.description;
			form.alertType = data.type;
			form.tracking = 'vehicles';
			form.interval = data.alert_interval_minutes;
			form.receivers = data.receivers.map((r: any) => ({
				receiverName: r.receiverName,
				phoneNumber: r.phoneNumber || '',
				email: r.email || '',
				origin: r.origin || 'custom',
				originId: r.originId || null,
				contactSms: !!r.phoneNumber,
				contactEmail: !!r.email,
			}));
			form.tempMin = data.trigger_values.min || null;
			form.tempMax = data.trigger_values.max || null;
			form.selectedTrackingItems = data.vehicles;
			vehiclesList.value = await getVehicles();
			form.activeHours = data.active_hours.length ? data.active_hours : [{ from: '', to: '' }];
			form.dateRanges = data.active_dates.length ? data.active_dates : [{ from: '', to: '' }];
		} catch (error) {
			console.error('Error fetching alert setting for edit:', error);
		} finally {
			isLoading.value = false;
		}
	}
});

function resetForm() {
	form.description = '';
	form.alertType = '';
	form.tracking = 'placeholder';
	form.selectedTrackingItems = [];
	form.dateRanges = [{ from: '', to: '' }];
	form.activeHours = [{ from: '', to: '' }];
	form.interval = null;
	form.receiverOption = null;
	form.receivers = [];
	form.tempMin = null;
	form.tempMax = null;
	form.delayMinutes = null;
}

function editReceiver(index: number) {
	editingIndex.value = index;
	Object.assign(editForm, form.receivers[index]);
}

function saveEdit() {
	if (editingIndex.value === null) return;
	const idx = editingIndex.value;
	form.receivers[idx] = {
		...form.receivers[idx], // keep origin + originId stable
		receiverName: editForm.receiverName,
		phoneNumber: editForm.phoneNumber,
		email: editForm.email,
		contactSms: editForm.contactSms,
		contactEmail: editForm.contactEmail,
	};
	editingIndex.value = null;
}

function cancelEdit() {
	editingIndex.value = null; // just drop changes → list stays unchanged
}

let cachedVehicles: { id: string; registration: string }[] = [];
async function getVehicles(forceRefresh = false) {
	const CACHE_KEY = 'vehicles_cache';
	const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

	try {
		if (!forceRefresh && cachedVehicles.length) {
			vehiclesList.value = cachedVehicles;
			return cachedVehicles;
		}

		const cached = localStorage.getItem(CACHE_KEY);
		if (!forceRefresh && cached) {
			const { data, timestamp } = JSON.parse(cached);
			const age = Date.now() - timestamp;
			if (age < CACHE_TTL_MS) {
				vehiclesList.value = data;
				return data;
			}
		}

		const { data, error } = await supabase.from('vehicles').select('vehicle_id, licence_number');
		if (error) throw error;

		const mapped =
			data?.map((v) => ({
				id: v.vehicle_id ?? '',
				registration: v.licence_number ?? '',
			})) || [];

		localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
		cachedVehicles = mapped;
		vehiclesList.value = mapped;
		return mapped;
	} catch (error) {
		console.error('Error fetching vehicles:', error);
		return [];
	}
}

let cachedDrivers: Driver[] = [];
//Param for refresh in UI later on
async function getDrivers(forceRefresh = false) {
	const CACHE_KEY = 'drivers_cache';
	const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
	try {
		if (!forceRefresh && cachedDrivers.length) {
			drivers.value = cachedDrivers;
			return drivers.value;
		}
		const cached = localStorage.getItem(CACHE_KEY);
		if (!forceRefresh && cached) {
			const { data, timestamp } = JSON.parse(cached);
			const age = Date.now() - timestamp;
			if (age < CACHE_TTL_MS) {
				drivers.value = data;
				return drivers.value;
			}
		}
		// Fetch from Supabase
		const { data, error } = await supabase
			.from('drivers')
			.select('user_id, contact_phone_number, contact_email, drivers_user_id_fkey (display_name)');
		if (error) throw error;

		const mapped = data.map((d) => ({
			id: d.user_id ?? '',
			phoneNumber: d.contact_phone_number || '',
			email: d.contact_email || '',
			displayName:
				(d.drivers_user_id_fkey as unknown as { display_name: string })?.display_name || 'No Name',
		}));

		localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
		drivers.value = mapped;
		return mapped;
	} catch (error) {
		console.error('Error fetching drivers:', error);
		return [];
	}
}

let cachedCustomers: { id: string; name: string; locations: any[] }[] = [];
async function getCustomers(forceRefresh = false) {
	const CACHE_KEY = 'customers_cache';
	const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

	try {
		if (!forceRefresh && cachedCustomers.length) {
			customers.value = cachedCustomers;
			return cachedCustomers;
		}

		const cached = localStorage.getItem(CACHE_KEY);
		if (!forceRefresh && cached) {
			const { data, timestamp } = JSON.parse(cached);
			const age = Date.now() - timestamp;
			if (age < CACHE_TTL_MS) {
				customers.value = data;
				return data;
			}
		}

		const { data, error } = await supabase.from('customers').select('customer_id, name');
		if (error) throw error;

		const mapped =
			data?.map((c) => ({
				id: c.customer_id,
				name: c.name || 'No Name',
				locations: [],
			})) || [];

		localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
		cachedCustomers = mapped;
		customers.value = cachedCustomers;

		return mapped;
	} catch (error) {
		console.error('Error fetching customers:', error);
		return [];
	}
}

const cachedCustomerLocations: Record<string, CustomerLocation[]> = {};
async function getCustomerLocations(customerId: string, forceRefresh = false) {
	const CACHE_KEY = `customer_locations_${customerId}`;
	const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
	loadingLocations.value[customerId] = true;

	try {
		if (!forceRefresh && cachedCustomerLocations[customerId]?.length) {
			customerLocations.value[customerId] = cachedCustomerLocations[customerId];
			return cachedCustomerLocations[customerId];
		}

		const cached = localStorage.getItem(CACHE_KEY);
		if (!forceRefresh && cached) {
			const { data, timestamp } = JSON.parse(cached);
			const age = Date.now() - timestamp;
			if (age < CACHE_TTL_MS) {
				customerLocations.value[customerId] = data;
				return data;
			}
		}

		const { data, error } = await supabase
			.from('customer_locations')
			.select(
				'customer_location_id, location_name, contact_person, contact_phone_number, contact_email',
			)
			.eq('customer_id', customerId);
		if (error) throw error;

		const mapped =
			data?.map((loc) => ({
				id: loc.customer_location_id,
				name: loc.location_name || 'No Name',
				contactPerson: loc.contact_person || 'No Contact',
				phoneNumber: loc.contact_phone_number || '',
				email: loc.contact_email || '',
			})) || [];

		localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
		customerLocations.value[customerId] = mapped;
		cachedCustomerLocations[customerId] = mapped;

		return mapped;
	} catch (error) {
		console.error(`Error fetching customer locations for ${customerId}:`, error);
		return [];
	} finally {
		loadingLocations.value[customerId] = false;
	}
}

function addSelectedDrivers() {
	Object.values(selections).forEach((sel) => {
		console.log(sel);
		if (sel.contactSms || sel.contactEmail) {
			// Avoid duplicates (same originId already in receivers)
			const existing = form.receivers.find(
				(r) => r.originId === sel.originId && r.origin === sel.origin,
			);
			if (existing) {
				existing.contactSms = sel.contactSms;
				existing.contactEmail = sel.contactEmail;
				existing.phoneNumber = sel.phoneNumber;
				existing.email = sel.email;
			} else {
				form.receivers.push({ ...sel });
			}
		}
	});

	// Clear selections after adding
	for (const key in selections) {
		delete selections[key];
	}
}

function addSelectedCustomerLocations() {
	Object.values(selections).forEach((sel) => {
		if (sel.origin === 'customer' && (sel.contactSms || sel.contactEmail)) {
			const existing = form.receivers.find(
				(r) => r.originId === sel.originId && r.origin === 'customer',
			);

			if (existing) {
				existing.contactSms = sel.contactSms;
				existing.contactEmail = sel.contactEmail;
				existing.phoneNumber = sel.phoneNumber;
				existing.email = sel.email;
			} else {
				form.receivers.push({ ...sel });
			}
		}
	});

	// Reset just customer location selections
	for (const key in selections) {
		if (key.startsWith('loc-')) delete selections[key];
	}
}

async function handleSubmit() {
	try {
		const { isAuthenticated, access_token } = await authenticateUser();
		if (!isAuthenticated || !access_token) return;

		const result = DeliveryAlertSettingsFormSchema.safeParse(form);
		console.log('Form data to validate:', form);
		console.log('Validation result:', result);

		const formattedReceivers = form.receivers.map((r) => ({
			receiverName: r.receiverName,
			phoneNumber: r.phoneNumber || null,
			email: r.email || null,
			origin: r.origin || 'custom',
			originId: r.originId || null,
		}));

		const triggerValues =
			form.alertType === 'temperature'
				? { min: form.tempMin ?? undefined, max: form.tempMax ?? undefined }
				: { delayMinutes: form.delayMinutes! };

		if (pageMode.value === 'edit' && id) {
			const alertSettingToUpdate = {
				description: form.description,
				vehicles: form.selectedTrackingItems,
				type: form.alertType,
				active_hours: form.activeHours,
				receivers: formattedReceivers,
				active_dates: form.dateRanges,
				alert_interval_minutes: form.interval,
				trigger_values: triggerValues,
				status: 'active',
				updated_at: new Date().toISOString(),
				is_deleted: null,
			};
			const response = await fetch(`http://localhost:8080/api/delivery-alert-setting/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify(alertSettingToUpdate),
			});
			console.log(response);
		} else {
			const alertSettingToAdd = {
				description: form.description,
				vehicles: form.selectedTrackingItems,
				type: form.alertType,
				active_hours: form.activeHours,
				receivers: formattedReceivers,
				active_dates: form.dateRanges,
				alert_interval_minutes: form.interval,
				trigger_values: triggerValues,
				status: 'active',
				created_at: null,
				updated_at: null,
				is_deleted: null,
			};
			const response = await fetch('http://localhost:8080/api/delivery-alert-setting/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify(alertSettingToAdd),
			});
			console.log(response);
		}
		//Reset form after successful submission
		resetForm();
	} catch (error) {
		console.error('Error submitting form:', error);
	}
}

function clearCache() {
	localStorage.removeItem('vehicles_cache');
	localStorage.removeItem('drivers_cache');
	localStorage.removeItem('customers_cache');
	// Remove all customer location caches
	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith('customer_locations_')) {
			localStorage.removeItem(key);
		}
	});
}

function ensureSelection(
	entity: any,
	type: 'contactSms' | 'contactEmail',
	checked: boolean,
	options: { origin: 'driver' | 'customer'; keyPrefix: string },
) {
	const key = `${options.keyPrefix}-${entity.id}`;

	if (checked) {
		if (!selections[key]) {
			selections[key] = {
				receiverName:
					options.origin === 'driver'
						? entity.displayName || entity.display_name || ''
						: `${entity.name} (${entity.contactPerson})`,
				phoneNumber: entity.phoneNumber || '',
				email: entity.email || '',
				contactSms: false,
				contactEmail: false,
				origin: options.origin,
				originId: entity.id,
			};
		}
		selections[key][type] = true;
	} else {
		if (!selections[key]) return;
		selections[key][type] = false;
		if (!selections[key].contactSms && !selections[key].contactEmail) {
			delete selections[key];
		}
	}
}

function addReceiver() {
	if (!newReceiver.receiverName) return;
	if (!newReceiver.contactSms && !newReceiver.contactEmail) {
		alert('Please select at least one contact method (SMS or Email).');
		return;
	}

	form.receivers.push({ ...newReceiver });

	// Reset form after adding
	newReceiver.receiverName = '';
	newReceiver.phoneNumber = '';
	newReceiver.email = '';
	newReceiver.contactEmail = false;
	newReceiver.contactSms = false;
}

function removeReceiver(index: number) {
	form.receivers.splice(index, 1);
}

// Date ranges
function addDateRange() {
	form.dateRanges.push({ from: '', to: '' });
}
function removeDateRange(index: number) {
	form.dateRanges.splice(index, 1);
}

// Active hours
function addActiveHours() {
	form.activeHours.push({ from: '', to: '' });
}
function removeActiveHours(index: number) {
	form.activeHours.splice(index, 1);
}
</script>

<style lang="css" scoped>
.receiver-form {
	padding: 1rem;
	border-radius: 6px;
}

.receiver-form label {
	display: block;
	margin-bottom: 0.5rem;
}

.edit-form {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.contact-method {
	margin: 0.5rem 0;
}

.receiver-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-top: 1rem;
}

.receiver-item {
	border: 1px solid #ddd;
	border-radius: 6px;
	padding: 0.75rem;
}

.save-section {
	margin-top: 1rem;
	text-align: center;
}

.btn {
	padding: 6px 12px;
	border-radius: 4px;
	border: none;
	cursor: pointer;
}

.btn-add {
	background-color: #39618c;
	color: #fff;
}

.btn-edit {
	background-color: #d1af49;
	color: #fff;
}

.btn-delete {
	background-color: #7b3038;
	color: #fff;
}

.btn-save {
	background-color: #246b34;
	color: #fff;
}

.btn:hover {
	opacity: 0.9;
}

.tab {
	padding: 6px 10px;
	margin-right: 6px;
	border-radius: 6px;
	cursor: pointer;
	border: 0;
}
.tab.active {
	background: #007bff;
	color: white;
}

.list-row,
.location-item {
	padding: 8px;
	border: 1px solid #b8b8b8;
	border-radius: 6px;
	margin-bottom: 8px;
}
.select-row {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 600;
	margin-bottom: 6px;
}
.details {
	margin-top: 6px;
}
.contact-options {
	margin-top: 6px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.cust-summary {
	font-weight: 700;
}

.btn {
	padding: 6px 10px;
	border-radius: 6px;
	border: 0;
	cursor: pointer;
}
.btn-add {
	background: #007bff;
}
</style>
