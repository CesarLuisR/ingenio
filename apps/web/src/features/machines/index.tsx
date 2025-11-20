import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMachines, type MachineWithRelations } from "./hooks/useMachine";
import { MachineFormModal } from "./components/MachineModal";
import { MachineCard } from "./components/MachineCard";
import { api } from "../../lib/api";
import { useSessionStore } from "../../store/sessionStore";
import { ROLES } from "../../types";

import {
	Container,
	Header,
	HeaderRight,
	Title,
	SubTitle,
	ListSummary,
	Button,
	MachineList,
	LoadingText,
	ErrorBox,
	ListHeaderRow,
	EmptyState,
	FiltersBar,
	FiltersRight,
	CheckboxLabel,
	ResetFiltersButton,
	SortDirButton,
	TextInput,
} from "./styled";

type SortField = "name" | "code" | "createdAt";

export default function MachinesPage() {
	const navigate = useNavigate();
	const { user } = useSessionStore();
	const { machines, loading, error, reload, setMachines } = useMachines();

	const [search, setSearch] = useState("");
	const [onlyActive, setOnlyActive] = useState(false);
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedMachine, setSelectedMachine] =
		useState<MachineWithRelations | null>(null);

	const canManage =
		user &&
		(user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN);

	const filteredMachines = useMemo(() => {
		let data = [...machines];

		if (search.trim()) {
			const term = search.toLowerCase();
			data = data.filter(
				(m) =>
					m.name.toLowerCase().includes(term) ||
					m.code.toLowerCase().includes(term) ||
					(m.location ?? "").toLowerCase().includes(term)
			);
		}

		if (onlyActive) {
			data = data.filter((m) => m.active);
		}

		data.sort((a, b) => {
			let av: string | number = "";
			let bv: string | number = "";

			if (sortField === "name") {
				av = a.name.toLowerCase();
				bv = b.name.toLowerCase();
			} else if (sortField === "code") {
				av = a.code.toLowerCase();
				bv = b.code.toLowerCase();
			} else {
				av = new Date(a.createdAt).getTime();
				bv = new Date(b.createdAt).getTime();
			}

			if (av < bv) return sortDir === "asc" ? -1 : 1;
			if (av > bv) return sortDir === "asc" ? 1 : -1;
			return 0;
		});

		return data;
	}, [machines, search, onlyActive, sortField, sortDir]);

	const total = machines.length;
	const activeCount = machines.filter((m) => m.active).length;

	const openCreateModal = () => {
		setModalMode("create");
		setSelectedMachine(null);
		setModalOpen(true);
	};

	const openEditModal = (machine: MachineWithRelations) => {
		setModalMode("edit");
		setSelectedMachine(machine);
		setModalOpen(true);
	};

	const handleSaved = (saved: MachineWithRelations) => {
		setMachines((prev) => {
			const exists = prev.some((m) => m.id === saved.id);
			if (exists) {
				return prev.map((m) =>
					m.id === saved.id ? { ...m, ...saved } : m
				);
			}
			return [...prev, saved];
		});
	};

	const handleDelete = async (machine: MachineWithRelations) => {
		const confirmDelete = window.confirm(
			`¿Seguro que deseas eliminar la máquina "${machine.name}"?`
		);
		if (!confirmDelete) return;

		try {
			await api.deleteMachine(machine.id);
			setMachines((prev) => prev.filter((m) => m.id !== machine.id));
		} catch (err: any) {
			alert(
				err?.message ||
					"Error al eliminar la máquina. Intenta nuevamente."
			);
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setOnlyActive(false);
		setSortField("name");
		setSortDir("asc");
	};

	const handleView = (machine: MachineWithRelations) => {
		navigate(`/maquinas/${machine.id}`);
	};

	return (
		<Container>
			<Header>
				<div>
					<Title>Máquinas</Title>
					<SubTitle>
						Inventario de equipos del ingenio. Inspecciona sensores, estado,
						mantenimientos y fallas.
					</SubTitle>

					<ListSummary>
						<span>{total} máquinas</span>
						<span>{activeCount} activas</span>
						<span>{total - activeCount} inactivas</span>
					</ListSummary>
				</div>

				<HeaderRight>
					{canManage && (
						<Button onClick={openCreateModal}>Nueva máquina</Button>
					)}
				</HeaderRight>
			</Header>

			<FiltersBar>
				<TextInput
					placeholder="Buscar por nombre, código o ubicación…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<select
					value={sortField}
					onChange={(e) => setSortField(e.target.value as SortField)}
					style={{
						padding: "8px 12px",
						borderRadius: "10px",
						border: "1px solid #cbd5e1",
						fontSize: "14px",
						background: "white",
					}}
				>
					<option value="name">Ordenar por nombre</option>
					<option value="code">Ordenar por código</option>
					<option value="createdAt">Ordenar por fecha de creación</option>
				</select>

				<FiltersRight>
					<CheckboxLabel>
						<input
							type="checkbox"
							checked={onlyActive}
							onChange={(e) => setOnlyActive(e.target.checked)}
						/>
						Solo activas
					</CheckboxLabel>

					<SortDirButton
						type="button"
						onClick={() =>
							setSortDir((d) => (d === "asc" ? "desc" : "asc"))
						}
					>
						{sortDir === "asc" ? "Ascendente ↑" : "Descendente ↓"}
					</SortDirButton>

					<ResetFiltersButton type="button" onClick={handleResetFilters}>
						Reiniciar
					</ResetFiltersButton>
				</FiltersRight>
			</FiltersBar>

			{loading && <LoadingText>Cargando máquinas…</LoadingText>}
			{error && !loading && <ErrorBox>{error}</ErrorBox>}

			{!loading && !error && filteredMachines.length === 0 && (
				<EmptyState>
					<p>No se encontraron máquinas con los filtros actuales.</p>
					{canManage && (
						<button type="button" onClick={openCreateModal}>
							Registrar máquina
						</button>
					)}
				</EmptyState>
			)}

			{!loading && !error && filteredMachines.length > 0 && (
				<MachineList>
					{filteredMachines.map((m) => (
						<MachineCard
							key={m.id}
							machine={m}
							onView={handleView}
							onEdit={openEditModal}
							onDelete={handleDelete}
						/>
					))}
				</MachineList>
			)}

			<MachineFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				mode={modalMode}
				onSaved={handleSaved}
				initialMachine={modalMode === "edit" ? selectedMachine : null}
			/>
		</Container>
	);
}
