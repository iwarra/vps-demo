export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '13.0.4';
	};
	public: {
		Tables: {
			alert_logs: {
				Row: {
					alert_type: string;
					device_id: number | null;
					id: string;
					is_active: boolean | null;
					message: string | null;
					readings_id: number | null;
					sent: boolean | null;
					sent_at: string | null;
					sent_to: string | null;
					triggered_at: string | null;
				};
				Insert: {
					alert_type: string;
					device_id?: number | null;
					id?: string;
					is_active?: boolean | null;
					message?: string | null;
					readings_id?: number | null;
					sent?: boolean | null;
					sent_at?: string | null;
					sent_to?: string | null;
					triggered_at?: string | null;
				};
				Update: {
					alert_type?: string;
					device_id?: number | null;
					id?: string;
					is_active?: boolean | null;
					message?: string | null;
					readings_id?: number | null;
					sent?: boolean | null;
					sent_at?: string | null;
					sent_to?: string | null;
					triggered_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'alert_logs_readings_id_fkey';
						columns: ['readings_id'];
						isOneToOne: false;
						referencedRelation: 'weather_readings';
						referencedColumns: ['id'];
					},
				];
			};
			alert_settings: {
				Row: {
					active: boolean | null;
					alert_text: string | null;
					alert_type: string;
					cooldown_interval: number | null;
					email: string | null;
					id: string;
					phone_number: string | null;
					threshold_max: number | null;
					threshold_min: number | null;
				};
				Insert: {
					active?: boolean | null;
					alert_text?: string | null;
					alert_type: string;
					cooldown_interval?: number | null;
					email?: string | null;
					id?: string;
					phone_number?: string | null;
					threshold_max?: number | null;
					threshold_min?: number | null;
				};
				Update: {
					active?: boolean | null;
					alert_text?: string | null;
					alert_type?: string;
					cooldown_interval?: number | null;
					email?: string | null;
					id?: string;
					phone_number?: string | null;
					threshold_max?: number | null;
					threshold_min?: number | null;
				};
				Relationships: [];
			};
			app_users: {
				Row: {
					display_language: string;
					display_name: string | null;
					first_name: string;
					id: string;
					last_name: string;
					role: string;
					user_id: string;
				};
				Insert: {
					display_language: string;
					display_name?: string | null;
					first_name: string;
					id?: string;
					last_name: string;
					role: string;
					user_id: string;
				};
				Update: {
					display_language?: string;
					display_name?: string | null;
					first_name?: string;
					id?: string;
					last_name?: string;
					role?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			bookings: {
				Row: {
					booked_by: string | null;
					booking_id: string;
					created_at: string | null;
					customer_booking_note: string | null;
					customer_booking_reference: string | null;
					customer_id: string | null;
				};
				Insert: {
					booked_by?: string | null;
					booking_id?: string;
					created_at?: string | null;
					customer_booking_note?: string | null;
					customer_booking_reference?: string | null;
					customer_id?: string | null;
				};
				Update: {
					booked_by?: string | null;
					booking_id?: string;
					created_at?: string | null;
					customer_booking_note?: string | null;
					customer_booking_reference?: string | null;
					customer_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'bookings_booked_by_fkey';
						columns: ['booked_by'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'bookings_customer_id_fkey';
						columns: ['customer_id'];
						isOneToOne: false;
						referencedRelation: 'customers';
						referencedColumns: ['customer_id'];
					},
				];
			};
			customer_feedback: {
				Row: {
					added_by: string | null;
					booking_id: string | null;
					customer_feedback_id: string;
					customer_id: string | null;
					delivery_id: string | null;
					feedback: string | null;
					incoming_date: string | null;
					type: string | null;
				};
				Insert: {
					added_by?: string | null;
					booking_id?: string | null;
					customer_feedback_id?: string;
					customer_id?: string | null;
					delivery_id?: string | null;
					feedback?: string | null;
					incoming_date?: string | null;
					type?: string | null;
				};
				Update: {
					added_by?: string | null;
					booking_id?: string | null;
					customer_feedback_id?: string;
					customer_id?: string | null;
					delivery_id?: string | null;
					feedback?: string | null;
					incoming_date?: string | null;
					type?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'customer_feedback_added_by_fkey';
						columns: ['added_by'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'customer_feedback_customer_id_fkey';
						columns: ['customer_id'];
						isOneToOne: false;
						referencedRelation: 'customers';
						referencedColumns: ['customer_id'];
					},
				];
			};
			customer_locations: {
				Row: {
					address: string | null;
					contact_email: string | null;
					contact_person: string | null;
					contact_phone_number: string | null;
					customer_id: string | null;
					customer_location_id: string;
					drop_off: boolean | null;
					earliest_dropoff_time: string | null;
					earliest_pickup_time: string | null;
					latest_dropoff_time: string | null;
					latest_pickup_time: string | null;
					location_name: string | null;
					pickup: boolean | null;
					status: string | null;
					timezone: string;
				};
				Insert: {
					address?: string | null;
					contact_email?: string | null;
					contact_person?: string | null;
					contact_phone_number?: string | null;
					customer_id?: string | null;
					customer_location_id?: string;
					drop_off?: boolean | null;
					earliest_dropoff_time?: string | null;
					earliest_pickup_time?: string | null;
					latest_dropoff_time?: string | null;
					latest_pickup_time?: string | null;
					location_name?: string | null;
					pickup?: boolean | null;
					status?: string | null;
					timezone?: string;
				};
				Update: {
					address?: string | null;
					contact_email?: string | null;
					contact_person?: string | null;
					contact_phone_number?: string | null;
					customer_id?: string | null;
					customer_location_id?: string;
					drop_off?: boolean | null;
					earliest_dropoff_time?: string | null;
					earliest_pickup_time?: string | null;
					latest_dropoff_time?: string | null;
					latest_pickup_time?: string | null;
					location_name?: string | null;
					pickup?: boolean | null;
					status?: string | null;
					timezone?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'customer_locations_customer_id_fkey';
						columns: ['customer_id'];
						isOneToOne: false;
						referencedRelation: 'customers';
						referencedColumns: ['customer_id'];
					},
				];
			};
			customers: {
				Row: {
					address: string | null;
					customer_id: string;
					name: string | null;
					org_number: string | null;
					user_id: string | null;
				};
				Insert: {
					address?: string | null;
					customer_id?: string;
					name?: string | null;
					org_number?: string | null;
					user_id?: string | null;
				};
				Update: {
					address?: string | null;
					customer_id?: string;
					name?: string | null;
					org_number?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'customers_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
				];
			};
			deliveries: {
				Row: {
					booking_id: string | null;
					customer_delivery_note: string | null;
					delivery_end_date: string | null;
					delivery_id: string;
					delivery_notice: string;
					delivery_post_status: string;
					delivery_reference: string | null;
					delivery_start_date: string | null;
					delivery_status: string;
					delivery_type: string | null;
					dropoff_location_id: string | null;
					estimated_arrival_time: string | null;
					pickup_location_id: string | null;
				};
				Insert: {
					booking_id?: string | null;
					customer_delivery_note?: string | null;
					delivery_end_date?: string | null;
					delivery_id?: string;
					delivery_notice: string;
					delivery_post_status: string;
					delivery_reference?: string | null;
					delivery_start_date?: string | null;
					delivery_status: string;
					delivery_type?: string | null;
					dropoff_location_id?: string | null;
					estimated_arrival_time?: string | null;
					pickup_location_id?: string | null;
				};
				Update: {
					booking_id?: string | null;
					customer_delivery_note?: string | null;
					delivery_end_date?: string | null;
					delivery_id?: string;
					delivery_notice?: string;
					delivery_post_status?: string;
					delivery_reference?: string | null;
					delivery_start_date?: string | null;
					delivery_status?: string;
					delivery_type?: string | null;
					dropoff_location_id?: string | null;
					estimated_arrival_time?: string | null;
					pickup_location_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'deliveries_booking_id_fkey';
						columns: ['booking_id'];
						isOneToOne: false;
						referencedRelation: 'bookings';
						referencedColumns: ['booking_id'];
					},
					{
						foreignKeyName: 'deliveries_dropoff_location_id_fkey';
						columns: ['dropoff_location_id'];
						isOneToOne: false;
						referencedRelation: 'customer_locations';
						referencedColumns: ['customer_location_id'];
					},
					{
						foreignKeyName: 'deliveries_pickup_location_id_fkey';
						columns: ['pickup_location_id'];
						isOneToOne: false;
						referencedRelation: 'customer_locations';
						referencedColumns: ['customer_location_id'];
					},
				];
			};
			delivery_alert_logs: {
				Row: {
					alert_type: string | null;
					created_at: string | null;
					delivery_alert_log_id: string;
					delivery_alert_setting_id: string | null;
					metric_value: number | null;
					receivers: Json | null;
					sent: boolean | null;
					sent_at: string | null;
					vehicle_id: string | null;
				};
				Insert: {
					alert_type?: string | null;
					created_at?: string | null;
					delivery_alert_log_id?: string;
					delivery_alert_setting_id?: string | null;
					metric_value?: number | null;
					receivers?: Json | null;
					sent?: boolean | null;
					sent_at?: string | null;
					vehicle_id?: string | null;
				};
				Update: {
					alert_type?: string | null;
					created_at?: string | null;
					delivery_alert_log_id?: string;
					delivery_alert_setting_id?: string | null;
					metric_value?: number | null;
					receivers?: Json | null;
					sent?: boolean | null;
					sent_at?: string | null;
					vehicle_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'delivery_alert_logs_delivery_alert_setting_id_fkey';
						columns: ['delivery_alert_setting_id'];
						isOneToOne: false;
						referencedRelation: 'delivery_alert_settings';
						referencedColumns: ['delivery_alert_setting_id'];
					},
				];
			};
			delivery_alert_settings: {
				Row: {
					active_dates: Json | null;
					active_hours: Json | null;
					alert_interval_minutes: number | null;
					created_at: string | null;
					deleted_at: string | null;
					deleted_by: string | null;
					delivery_alert_setting_id: string;
					description: string | null;
					is_deleted: boolean | null;
					receivers: Json | null;
					status: string | null;
					trigger_values: Json | null;
					type: string | null;
					updated_at: string | null;
					vehicles: string[] | null;
				};
				Insert: {
					active_dates?: Json | null;
					active_hours?: Json | null;
					alert_interval_minutes?: number | null;
					created_at?: string | null;
					deleted_at?: string | null;
					deleted_by?: string | null;
					delivery_alert_setting_id?: string;
					description?: string | null;
					is_deleted?: boolean | null;
					receivers?: Json | null;
					status?: string | null;
					trigger_values?: Json | null;
					type?: string | null;
					updated_at?: string | null;
					vehicles?: string[] | null;
				};
				Update: {
					active_dates?: Json | null;
					active_hours?: Json | null;
					alert_interval_minutes?: number | null;
					created_at?: string | null;
					deleted_at?: string | null;
					deleted_by?: string | null;
					delivery_alert_setting_id?: string;
					description?: string | null;
					is_deleted?: boolean | null;
					receivers?: Json | null;
					status?: string | null;
					trigger_values?: Json | null;
					type?: string | null;
					updated_at?: string | null;
					vehicles?: string[] | null;
				};
				Relationships: [];
			};
			driver_status: {
				Row: {
					added_by: string | null;
					created_at: string | null;
					driver_id: string | null;
					driver_status_id: string;
					note: string | null;
					status: string | null;
				};
				Insert: {
					added_by?: string | null;
					created_at?: string | null;
					driver_id?: string | null;
					driver_status_id?: string;
					note?: string | null;
					status?: string | null;
				};
				Update: {
					added_by?: string | null;
					created_at?: string | null;
					driver_id?: string | null;
					driver_status_id?: string;
					note?: string | null;
					status?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'driver_status_added_by_fkey';
						columns: ['added_by'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'driver_status_driver_id_fkey';
						columns: ['driver_id'];
						isOneToOne: false;
						referencedRelation: 'drivers';
						referencedColumns: ['driver_id'];
					},
				];
			};
			drivers: {
				Row: {
					address: string | null;
					contact_email: string | null;
					contact_phone_number: string | null;
					driver_id: string;
					personal_number: string | null;
					user_id: string | null;
				};
				Insert: {
					address?: string | null;
					contact_email?: string | null;
					contact_phone_number?: string | null;
					driver_id?: string;
					personal_number?: string | null;
					user_id?: string | null;
				};
				Update: {
					address?: string | null;
					contact_email?: string | null;
					contact_phone_number?: string | null;
					driver_id?: string;
					personal_number?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'drivers_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
				];
			};
			gps_data: {
				Row: {
					id: number;
					imei: string;
					lat: number;
					lng: number;
					speed: number | null;
					timestamp: string;
				};
				Insert: {
					id?: number;
					imei: string;
					lat: number;
					lng: number;
					speed?: number | null;
					timestamp?: string;
				};
				Update: {
					id?: number;
					imei?: string;
					lat?: number;
					lng?: number;
					speed?: number | null;
					timestamp?: string;
				};
				Relationships: [];
			};
			parcels: {
				Row: {
					customer_parcel_note: string | null;
					customer_parcel_reference: string | null;
					delivery_id: string | null;
					height_cm: number | null;
					length_cm: number | null;
					parcel_id: string;
					parcel_type: string | null;
					temp_condition: string | null;
					weight_kg: number | null;
					width_cm: number | null;
				};
				Insert: {
					customer_parcel_note?: string | null;
					customer_parcel_reference?: string | null;
					delivery_id?: string | null;
					height_cm?: number | null;
					length_cm?: number | null;
					parcel_id?: string;
					parcel_type?: string | null;
					temp_condition?: string | null;
					weight_kg?: number | null;
					width_cm?: number | null;
				};
				Update: {
					customer_parcel_note?: string | null;
					customer_parcel_reference?: string | null;
					delivery_id?: string | null;
					height_cm?: number | null;
					length_cm?: number | null;
					parcel_id?: string;
					parcel_type?: string | null;
					temp_condition?: string | null;
					weight_kg?: number | null;
					width_cm?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'parcels_delivery_id_fkey';
						columns: ['delivery_id'];
						isOneToOne: false;
						referencedRelation: 'deliveries';
						referencedColumns: ['delivery_id'];
					},
				];
			};
			vehicle_devices: {
				Row: {
					added_by: string;
					created_at: string | null;
					device_type: string;
					master_vehicle_device_id: string;
					sim_card: string | null;
					vehicle_device_id: string;
					vehicle_id: string;
				};
				Insert: {
					added_by: string;
					created_at?: string | null;
					device_type: string;
					master_vehicle_device_id: string;
					sim_card?: string | null;
					vehicle_device_id?: string;
					vehicle_id: string;
				};
				Update: {
					added_by?: string;
					created_at?: string | null;
					device_type?: string;
					master_vehicle_device_id?: string;
					sim_card?: string | null;
					vehicle_device_id?: string;
					vehicle_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'vehicle_devices_added_by_fkey';
						columns: ['added_by'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'vehicle_devices_vehicle_id_fkey';
						columns: ['vehicle_id'];
						isOneToOne: false;
						referencedRelation: 'vehicles';
						referencedColumns: ['vehicle_id'];
					},
				];
			};
			vehicle_driving_journals: {
				Row: {
					created_at: string | null;
					delivery_id: string | null;
					driver_id: string | null;
					location_coordinates: Json | null;
					odometer_reading: number | null;
					vehicle_driving_journal_id: string;
					vehicle_id: string;
				};
				Insert: {
					created_at?: string | null;
					delivery_id?: string | null;
					driver_id?: string | null;
					location_coordinates?: Json | null;
					odometer_reading?: number | null;
					vehicle_driving_journal_id?: string;
					vehicle_id: string;
				};
				Update: {
					created_at?: string | null;
					delivery_id?: string | null;
					driver_id?: string | null;
					location_coordinates?: Json | null;
					odometer_reading?: number | null;
					vehicle_driving_journal_id?: string;
					vehicle_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'vehicle_driving_journals_delivery_id_fkey';
						columns: ['delivery_id'];
						isOneToOne: false;
						referencedRelation: 'deliveries';
						referencedColumns: ['delivery_id'];
					},
					{
						foreignKeyName: 'vehicle_driving_journals_driver_id_fkey';
						columns: ['driver_id'];
						isOneToOne: false;
						referencedRelation: 'drivers';
						referencedColumns: ['driver_id'];
					},
					{
						foreignKeyName: 'vehicle_driving_journals_vehicle_id_fkey';
						columns: ['vehicle_id'];
						isOneToOne: false;
						referencedRelation: 'vehicles';
						referencedColumns: ['vehicle_id'];
					},
				];
			};
			vehicle_fuel_prices: {
				Row: {
					currency: string | null;
					date: string | null;
					price: number | null;
					source: string | null;
					type: string | null;
					vehicle_fuel_price_id: string;
				};
				Insert: {
					currency?: string | null;
					date?: string | null;
					price?: number | null;
					source?: string | null;
					type?: string | null;
					vehicle_fuel_price_id?: string;
				};
				Update: {
					currency?: string | null;
					date?: string | null;
					price?: number | null;
					source?: string | null;
					type?: string | null;
					vehicle_fuel_price_id?: string;
				};
				Relationships: [];
			};
			vehicle_status: {
				Row: {
					added_by: string | null;
					created_at: string | null;
					note: string | null;
					status: string | null;
					vehicle_id: string | null;
					vehicle_status_id: string;
				};
				Insert: {
					added_by?: string | null;
					created_at?: string | null;
					note?: string | null;
					status?: string | null;
					vehicle_id?: string | null;
					vehicle_status_id?: string;
				};
				Update: {
					added_by?: string | null;
					created_at?: string | null;
					note?: string | null;
					status?: string | null;
					vehicle_id?: string | null;
					vehicle_status_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'vehicle_status_added_by_fkey';
						columns: ['added_by'];
						isOneToOne: false;
						referencedRelation: 'app_users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'vehicle_status_vehicle_id_fkey';
						columns: ['vehicle_id'];
						isOneToOne: false;
						referencedRelation: 'vehicles';
						referencedColumns: ['vehicle_id'];
					},
				];
			};
			vehicles: {
				Row: {
					created_at: string | null;
					fuel_consumption: number | null;
					fuel_type: string | null;
					gear_shift_type: string | null;
					has_freezer: boolean | null;
					has_fridge: boolean | null;
					has_heater: boolean | null;
					licence_number: string | null;
					vehicle_id: string;
					vehicle_type: string | null;
				};
				Insert: {
					created_at?: string | null;
					fuel_consumption?: number | null;
					fuel_type?: string | null;
					gear_shift_type?: string | null;
					has_freezer?: boolean | null;
					has_fridge?: boolean | null;
					has_heater?: boolean | null;
					licence_number?: string | null;
					vehicle_id?: string;
					vehicle_type?: string | null;
				};
				Update: {
					created_at?: string | null;
					fuel_consumption?: number | null;
					fuel_type?: string | null;
					gear_shift_type?: string | null;
					has_freezer?: boolean | null;
					has_fridge?: boolean | null;
					has_heater?: boolean | null;
					licence_number?: string | null;
					vehicle_id?: string;
					vehicle_type?: string | null;
				};
				Relationships: [];
			};
			weather_readings: {
				Row: {
					created_at: string | null;
					device_id: number | null;
					id: number;
					lat: number;
					lon: number;
					observed_at: string;
					temperature_c: number | null;
					test_data: number;
					weathercode: number | null;
					winddirection: number | null;
					windspeed: number | null;
				};
				Insert: {
					created_at?: string | null;
					device_id?: number | null;
					id?: number;
					lat: number;
					lon: number;
					observed_at: string;
					temperature_c?: number | null;
					test_data: number;
					weathercode?: number | null;
					winddirection?: number | null;
					windspeed?: number | null;
				};
				Update: {
					created_at?: string | null;
					device_id?: number | null;
					id?: number;
					lat?: number;
					lon?: number;
					observed_at?: string;
					temperature_c?: number | null;
					test_data?: number;
					weathercode?: number | null;
					winddirection?: number | null;
					windspeed?: number | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
	? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
	? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
	? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
	? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
