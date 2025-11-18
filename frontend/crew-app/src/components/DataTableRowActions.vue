<script setup lang="ts" generic="TData">
import { DotsHorizontalIcon } from '@radix-icons/vue';
import { Button } from '../components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { Row } from '@tanstack/vue-table';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
	getId: (item: TData) => string;
	onDelete?: (item: TData) => Promise<void> | void;
	onEdit?: (item: TData) => void;
	onSeeMore?: (item: TData) => void;
	onCopy?: (item: TData) => void;
}

const props = defineProps<DataTableRowActionsProps<TData>>();
const item = props.row.original as TData;

function handleDelete() {
	props.onDelete?.(item as unknown as TData);
}

function handleEdit() {
	props.onEdit?.(item as unknown as TData);
}

function handleSeeMore() {
	props.onSeeMore?.(item as unknown as TData);
}

function handleCopy() {
	props.onCopy?.(item as unknown as TData);
}
</script>

<template>
	<DropdownMenu style="padding-left: 32px">
		<DropdownMenuTrigger as-child>
			<Button
				variant="ghost"
				class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
				<DotsHorizontalIcon class="h-4 w-4" />
				<!-- <span class="sr-only">Open menu</span> -->
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent
			align="end"
			class="w-40">
			<DropdownMenuItem @click="handleSeeMore">{{
				t('table_row_actions.view_more')
			}}</DropdownMenuItem>
			<DropdownMenuItem @click="handleEdit">{{ t('table_row_actions.edit') }}</DropdownMenuItem>
			<DropdownMenuItem @click="handleCopy">{{ t('table_row_actions.copy') }}</DropdownMenuItem>
			<!-- <DropdownMenuItem>Favorite</DropdownMenuItem> -->
			<!-- <DropdownMenuSeparator /> -->
			<!-- <DropdownMenuSub>
				<DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuRadioGroup :value="task.label">
						<DropdownMenuRadioItem
							v-for="label in labels"
							:key="label.value"
							:value="label.value">
							{{ label.label }}
						</DropdownMenuRadioItem> 
					</DropdownMenuRadioGroup>
				</DropdownMenuSubContent>
			</DropdownMenuSub> -->
			<DropdownMenuSeparator />
			<DropdownMenuItem
				@click="handleDelete"
				class="text-destructive">
				{{ t('table_row_actions.delete') }}
				<DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
