import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/react";
import {
  PlusIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
import {
  PageContainer,
  FormModal,
  FormField,
  ItemCard,
  usePageData,
  useFormModal,
} from "../components/common";
import type { StatItem } from "../components/common";
import type {
  Task,
  CreateTaskInput,
  TaskFilters,
  Deal,
  TaskStatus,
} from "../types";

interface TaskFormData {
  title: string;
  description?: string;
  deal_id?: string;
  due_date?: string;
  status?: string;
}

const TASK_STATUSES = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    items: tasks,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    refreshData,
  } = usePageData<Task, TaskFilters>({
    loadData: TaskService.getTasks,
    loadAdditionalData: async () => {
      const dealsData = await DealService.getDeals();
      setDeals(dealsData);
    },
  });

  const { isOpen, onOpen, onClose, form, handleSubmit, isSubmitting } =
    useFormModal<TaskFormData>({
      onSubmit: async (data) => {
        const taskData: CreateTaskInput = {
          title: data.title,
          description: data.description,
          deal_id: data.deal_id || undefined,
          due_date: data.due_date || undefined,
          status: (data.status as any) || "pending",
        };
        await TaskService.createTask(taskData);
      },
      onSuccess: refreshData,
    });

  const getStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: Record<
      string,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      completed: "success",
      overdue: "danger",
      pending: "warning",
    };
    return colors[status] || "warning";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckIcon className="w-4 h-4" />,
      overdue: <ExclamationTriangleIcon className="w-4 h-4" />,
      pending: <ClockIcon className="w-4 h-4" />,
    };
    return icons[status] || <ClockIcon className="w-4 h-4" />;
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  // Update overdue status for tasks
  const filteredTasks = tasks.map((task) => {
    if (isOverdue(task) && task.status === "pending") {
      return { ...task, status: "overdue" };
    }
    return task;
  });

  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending"
  );
  const overdueTasks = filteredTasks.filter(
    (task) => task.status === "overdue"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );

  const stats: StatItem[] = [
    {
      label: "Total Tasks",
      value: filteredTasks.length,
      icon: (
        <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      ),
      iconBgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Pending",
      value: pendingTasks.length,
      icon: (
        <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
      ),
      color: "text-yellow-600 dark:text-yellow-400",
      iconBgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: (
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
      ),
      color: "text-red-600 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      label: "Completed",
      value: completedTasks.length,
      icon: (
        <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
      ),
      color: "text-green-600 dark:text-green-400",
      iconBgColor: "bg-green-100 dark:bg-green-900",
    },
  ];

  const dealOptions = deals.map((deal) => ({
    key: deal.id,
    label: deal.title,
  }));

  const renderTaskItem = (task: Task) => (
    <ItemCard
      title={task.title}
      icon={getStatusIcon(task.status)}
      chipLabel={task.status}
      chipColor={getStatusColor(task.status)}
      chipIcon={getStatusIcon(task.status)}
      avatarColor={`bg-${getStatusColor(task.status)}-100 text-${getStatusColor(
        task.status
      )}`}
      metadata={[
        ...(task.due_date
          ? [{ label: "Due", value: formatDate(task.due_date) }]
          : []),
        ...(task.deal ? [{ label: "Deal", value: task.deal.title }] : []),
        { label: "Created", value: formatDate(task.created_at) },
      ]}
      content={task.description}
    />
  );

  const filtersContent = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        name="status"
        control={form.control}
        label="Status"
        type="select"
        placeholder="All statuses"
        options={[
          { key: "pending", label: "Pending" },
          { key: "completed", label: "Completed" },
          { key: "overdue", label: "Overdue" },
        ]}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value as TaskStatus }))
        }
      />
      <FormField
        name="deal_id"
        control={form.control}
        label="Deal"
        type="select"
        placeholder="All deals"
        options={dealOptions}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, deal_id: value }))
        }
      />
      <Input
        type="date"
        label="Due Date"
        value={filters.due_date || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, due_date: e.target.value }))
        }
      />
    </div>
  );

  return (
    <PageContainer
      title="Tasks"
      subtitle="Manage your tasks and track progress"
      actionLabel="Add Task"
      actionIcon={<PlusIcon className="w-4 h-4" />}
      onAction={onOpen}
      stats={stats}
      searchValue={filters.search || ""}
      onSearchChange={(value) =>
        setFilters((prev) => ({ ...prev, search: value }))
      }
      searchPlaceholder="Search tasks..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filtersContent={filtersContent}
      items={filteredTasks}
      loading={loading}
      renderItem={renderTaskItem}
      onItemClick={(task) => navigate(`/tasks/${task.id}`)}
      emptyState={{
        icon: <CalendarIcon className="w-16 h-16" />,
        title: "No tasks found",
        description: "Get started by creating your first task.",
        actionLabel: "Add Task",
        onAction: onOpen,
      }}
    >
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Create New Task"
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        submitLabel="Create Task"
      >
        <FormField
          name="title"
          control={form.control}
          label="Title"
          required
          placeholder="Enter task title"
        />
        <FormField
          name="description"
          control={form.control}
          label="Description"
          type="textarea"
          placeholder="Enter task description (optional)"
        />
        <FormField
          name="deal_id"
          control={form.control}
          label="Deal (Optional)"
          type="select"
          options={dealOptions}
        />
        <FormField
          name="due_date"
          control={form.control}
          label="Due Date (Optional)"
          type="date"
        />
        <FormField
          name="status"
          control={form.control}
          label="Status"
          type="select"
          options={TASK_STATUSES}
          defaultValue="pending"
        />
      </FormModal>
    </PageContainer>
  );
};

export default TasksPage;
