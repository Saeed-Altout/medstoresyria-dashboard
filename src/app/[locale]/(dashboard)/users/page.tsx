"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useGetUsers, useUserFilters, useToggleUserActive } from "@/lib/hooks/users";
import { useDebouncedSearch } from "@/hooks/use-table-filters";
import { getUserColumns } from "./_components/columns";
import { UsersToolbar } from "./_components/users-toolbar";
import { UserFormSheet } from "./_components/user-form-sheet";
import type { User, UserRole } from "@/types";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "users")) router.replace("/overview");
  }, [user, router]);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const { filters, setPage, setLimit, setFilter } = useUserFilters();
  const { data, isLoading } = useGetUsers(filters);
  const meta = data?.meta ?? { page: filters.page ?? 1, limit: filters.limit ?? 10, total: 0, totalPages: 1 };
  const toggleMutation = useToggleUserActive();
  const handleSearch = useDebouncedSearch(useUserFilters.getState().setSearch);

  function handleRoleChange(role: UserRole | undefined) {
    setRoleFilter(role ?? "all");
    setFilter("role", role);
  }

  const columns = useMemo(
    () =>
      getUserColumns({
        tName: tCommon("name"),
        tRole: t("role"),
        tActive: t("active"),
        tInactive: t("inactive"),
        tCreatedAt: t("created_at"),
        tActivate: t("activate"),
        tDeactivate: t("deactivate"),
        onEdit: (u) => { setEditUser(u); setFormOpen(true); },
        onToggle: setToggleTarget,
      }),
    [t, tCommon],
  );

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")}>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditUser(null); setFormOpen(true); }}>
            <IconPlus data-icon="inline-start" />
            {t("add_user")}
          </Button>
        )}
      </Header>

      <DataTable<User>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchable
        onSearch={handleSearch}
        toolbar={
          <UsersToolbar role={roleFilter} onRoleChange={handleRoleChange} />
        }
      />

      {isAdmin && (
        <UserFormSheet
          open={formOpen}
          onOpenChange={(o) => { setFormOpen(o); if (!o) setEditUser(null); }}
          user={editUser}
        />
      )}

      <ConfirmDialog
        open={toggleTarget !== null}
        onCancel={() => setToggleTarget(null)}
        title={tCommon("are_you_sure")}
        description={
          toggleTarget?.is_active ? t("deactivate_confirm") : t("activate_confirm")
        }
        onConfirm={() => {
          if (toggleTarget) {
            toggleMutation.mutate(toggleTarget.id, { onSuccess: () => setToggleTarget(null) });
          }
        }}
        isLoading={toggleMutation.isPending}
        variant={toggleTarget?.is_active ? "destructive" : "default"}
      />
    </div>
  );
}
