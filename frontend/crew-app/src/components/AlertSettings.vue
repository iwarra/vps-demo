<template>
	<div>
		<h1>Alert Settings</h1>

		<div>
			<!-- description -->
			<div style="display: block">
				<label for="description">Description: </label>
				<input
					type="text"
					id="description"
					v-model="form.description"
					required />
			</div>

			<!-- alert type - multiple select -->
			<div style="display: block; margin-top: 1rem">
				<label for="alertType">Alert type: </label>
				<label
					>Temperature
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="temperature"
				/></label>
				<label
					>Delivery delay
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="delay"
				/></label>
				<label
					>Speed
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="speed"
				/></label>
				<label
					>Out of range
					<input
						name="alertType"
						type="radio"
						v-model="form.alertType"
						value="out of range"
				/></label>
			</div>

			<!-- Conditional inputs -->
			<div v-if="form.alertType === 'temperature'">
				<label>
					Min Temperature:
					<input
						type="number"
						v-model.number="form.tempMin" />
				</label>
				<label>
					Max Temperature:
					<input
						type="number"
						v-model.number="form.tempMax" />
				</label>
			</div>

			<div v-else-if="form.alertType === 'delay'">
				<label>
					Delay Minutes:
					<input
						type="number"
						v-model.number="form.delayMinutes" />
				</label>
			</div>

			<!-- tracking - dropdown with vehicles, bookings,... -->
			<div style="display: block; margin-top: 1rem">
				<label
					for="tracking"
					disabled
					>Track by:
				</label>
				<select
					id="tracking"
					v-model="form.tracking"
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
			<div
				v-if="vehiclesList.length > 0"
				style="margin-top: 1rem">
				<label :for="form.tracking + '-list'"> Select {{ form.tracking }}: </label>
				<select
					:id="form.tracking + '-list'"
					v-model="form.selectedTrackingItems"
					required
					multiple>
					<option
						v-for="opt in vehiclesList"
						:key="opt.id"
						:value="opt.id">
						{{ opt.registration }}
					</option>
				</select>
			</div>

			<!-- Date ranges -->
			<div style="margin-top: 1rem">
				<label>Date ranges:</label>
				<div
					v-for="(range, index) in form.dateRanges"
					:key="index"
					style="margin-bottom: 0.5rem">
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
			<div style="margin-top: 1rem">
				<label>Active alert hours:</label>
				<div
					v-for="(hours, index) in form.activeHours"
					:key="index"
					style="margin-bottom: 0.5rem">
					<input
						type="time"
						v-model="hours.from"
						required />
					to
					<input
						type="time"
						v-model="hours.to"
						required />
					<button
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
					type="number"
					min="1"
					v-model="form.interval"
					required />
			</div>

			<!-- Receivers - create new or choose from existing -->
			<div style="margin-top: 1rem">
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

			<div
				v-if="form.receiverOption === 'create'"
				class="receiver-section">
				<!-- Receiver input form -->
				<div class="receiver-form">
					<label>
						Name:
						<input
							type="text"
							v-model="newReceiver.receiverName"
							required />
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
						class="btn btn-add"
						@click="addReceiver">
						Add Receiver
					</button>
				</div>
			</div>

			<div
				class="chooser"
				v-if="form.receiverOption === 'choose'">
				<div class="mode-switch">
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

				<div
					v-if="mode === 'drivers'"
					class="list">
					<h4>Drivers</h4>
					<div
						v-for="d in drivers"
						:key="d.id"
						class="list-item">
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
				<div
					v-if="mode === 'drivers'"
					class="actions">
					<button
						type="button"
						class="btn btn-add"
						@click="addSelectedDrivers">
						Add selected to list
					</button>
				</div>

				<!-- customers part-->
				<div
					v-if="mode === 'customers'"
					class="list">
					<h4>Customers</h4>
					<div
						v-for="c in customers"
						:key="c.id"
						class="customer list-item">
						<details @click="getCustomerLocations(c.id)">
							<summary class="cust-summary">
								{{ c.name }}
							</summary>
							<div v-if="loadingLocations[c.id]">Loading locations...</div>

							<ul v-else-if="customerLocations[c.id]">
								<li
									v-for="loc in customerLocations[c.id]"
									:key="loc.id"
									style="list-style: none; margin-bottom: 0.5rem">
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
						class="btn btn-add"
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
					<div v-if="editingIndex !== i">
						<strong>{{ receiver.receiverName }}</strong>
						<div v-if="receiver.contactSms">📱 {{ receiver.phoneNumber }}</div>
						<div v-if="receiver.contactEmail">✉️ {{ receiver.email }}</div>
						<div
							class="actions"
							style="margin-top: 1rem">
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
								v-model="editForm.receiverName" />
						</label>

						<label>
							Phone:
							<input
								type="tel"
								v-model="editForm.phoneNumber" />
							<input
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
								type="checkbox"
								v-model="editForm.contactEmail" />
							Use Email
						</label>

						<div
							class="actions"
							style="margin-top: 1rem">
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

			<!-- Save all receivers -->
			<div
				v-if="form.receivers.length"
				class="save-section">
				<button
					type="button"
					class="btn btn-save"
					@click="saveReceivers">
					Save Receiver(s)
				</button>
			</div>

			<div style="display: block; margin-top: 1rem"></div>
			<button
				@click="handleSubmit"
				type="button"
				style="margin-top: 1rem">
				Add alert
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { supabase } from '../supabase';
import type {
	Driver,
	Customer,
	CustomerLocation,
	VehicleInfo,
	Receiver,
	Selection,
} from '../../types';
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

const form = reactive({
	...initialForm,
});

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
				id: v.vehicle_id,
				registration: v.licence_number,
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
			id: d.user_id,
			phoneNumber: d.contact_phone_number || '',
			email: d.contact_email || '',
			displayName:
				(d.drivers_user_id_fkey as { display_name: string }[])[0]?.display_name || 'No Name',
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
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: import.meta.env.VITE_TEST_USER_EMAIL,
			password: import.meta.env.VITE_TEST_USER_PASSWORD,
		});

		const {
			data: { session },
		} = await supabase.auth.getSession();
		const accessToken = session?.access_token;

		if (signInError) throw signInError;
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

		const alertSettingToAdd = {
			description: form.description,
			vehicles: form.selectedTrackingItems,
			type:
				form.alertType == 'temperature' && form.tempMin
					? 'low_temperature'
					: form.alertType == 'temperature' && form.tempMax
					? 'high_temperature'
					: form.alertType,
			active_hours: form.activeHours,
			receivers: formattedReceivers,
			active_dates: form.dateRanges,
			alert_interval_minutes: form.interval,
			trigger_values: triggerValues,
			status: 'active',
			created_at: null,
		};
		console.log('Alert setting to send to BE: ', alertSettingToAdd);
		const response = await fetch('http://localhost:8080/api/delivery-alert-setting/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(alertSettingToAdd),
		});
		console.log(response);
		//Reset form after successful submission
		Object.assign(form, initialForm);
		form.receivers = []; //reset to remove the list of selected receivers from UI after submitting
	} catch (error) {
		console.error('Error submitting form:', error);
	}
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

//TODO remove and check that the rest works
function saveReceivers() {
	console.log('Receivers saved:', form.receivers);
	alert('Receivers saved successfully!');
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
.receiver-section {
	margin-top: 1rem;
}

.receiver-form {
	padding: 1rem;
	border-radius: 6px;
	margin-bottom: 1rem;
}

.receiver-form label {
	display: block;
	margin-bottom: 0.5rem;
}

.edit-form label {
	display: block;
	margin-bottom: 0.6rem;
}

.receiver-form input[type='text'],
.receiver-form input[type='tel'],
.receiver-form input[type='email'] {
	width: 100%;
	padding: 6px;
	margin-top: 4px;
	margin-bottom: 8px;
	border: 1px solid #969595;
	border-radius: 4px;
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

.actions button {
	margin-left: 0.5rem;
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

.chooser {
	margin-top: 1rem;
	padding: 12px;
	border-radius: 6px;
}
.mode-switch {
	margin-bottom: 8px;
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
.list {
	margin-top: 6px;
}
.list-item,
.location-item {
	padding: 8px;
	border: 1px solid #e9e9e9;
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
.chooser-actions {
	margin-top: 10px;
	display: flex;
	gap: 8px;
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
