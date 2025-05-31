import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Progress,
} from "@heroui/react";
import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
import { useDetailPage } from "../hooks/useDetailPage";
import DetailPageLayout from "../components/DetailPageLayout";
import HeroSection from "../components/HeroSection";
import DetailCard from "../components/DetailCard";
import SidebarActions from "../components/SidebarActions";
import DealCard from "../components/DealCard";
import type { Task, UpdateTaskInput, Deal, TaskStatus } from "../types";

interface TaskFormData {
  title: string;
  description?: string;
  deal_id?: string;
  due_date?: string;
  status: TaskStatus;
}

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    item: task,
    loading,
    submitting,
    isEditOpen,
    onEditOpen,
    onEditClose,
    handleUpdate,
    handleDelete,
    navigate,
  } = useDetailPage<Task>({
    id,
    loadItem: TaskService.getTask,
    updateItem: async (id: string, data: UpdateTaskInput) => {
      await TaskService.updateTask(id, data);
    },
    deleteItem: TaskService.deleteTask,
    redirectPath: "/tasks",
    itemName: "task",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const data = await DealService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error("Failed to load deals:", error);
    }
  };

  const handleEdit = () => {
    if (!task) return;
    reset({
      title: task.title,
      description: task.description || "",
      deal_id: task.deal_id || "",
      due_date: task.due_date || "",
      status: task.status,
    });
    onEditOpen();
  };

  const onEditSubmit = async (data: TaskFormData) => {
    const taskData: UpdateTaskInput = {
      title: data.title,
      description: data.description,
      deal_id: data.deal_id || undefined,
      due_date: data.due_date || undefined,
      status: data.status,
    };
    await handleUpdate(taskData);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      await TaskService.updateTaskStatus(task.id, newStatus);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckIcon className="w-5 h-5" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "overdue":
        return "danger";
      default:
        return "warning";
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressValue = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return 100;
      case "overdue":
        return 75;
      default:
        return 25;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const currentTask =
    task && isOverdue(task) && task.status === "pending"
      ? { ...task, status: "overdue" as TaskStatus }
      : task;

  if (!currentTask) return null;

  const sidebarActions = [
    {
      label: "Edit Task",
      color: "primary" as const,
      icon: <DocumentTextIcon className="w-4 h-4" />,
      onClick: handleEdit,
    },
    {
      label: "Delete Task",
      color: "danger" as const,
      icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      onClick: handleDelete,
    },
  ];

  const statusActions = () => {
    if (currentTask.status === "pending") {
      return (
        <Button
          color="success"
          size="lg"
          startContent={<CheckIcon className="w-5 h-5" />}
          onPress={() => handleStatusChange("completed")}
          className="font-semibold"
        >
          Mark Complete
        </Button>
      );
    }
    if (currentTask.status === "completed") {
      return (
        <Button
          color="warning"
          size="lg"
          startContent={<PauseIcon className="w-5 h-5" />}
          onPress={() => handleStatusChange("pending")}
          className="font-semibold"
        >
          Reopen Task
        </Button>
      );
    }
    if (currentTask.status === "overdue") {
      return (
        <Button
          color="success"
          size="lg"
          startContent={<CheckIcon className="w-5 h-5" />}
          onPress={() => handleStatusChange("completed")}
          className="font-semibold"
        >
          Complete Now
        </Button>
      );
    }
    return null;
  };

  const timelineItems = [
    {
      label: "Due Date",
      value: currentTask.due_date ? (
        <>
          {formatDate(currentTask.due_date)}
          {getDaysUntilDue(currentTask.due_date) < 0 ? (
            <span className="ml-2 text-red-500 text-sm font-semibold">
              (Overdue)
            </span>
          ) : getDaysUntilDue(currentTask.due_date) <= 3 ? (
            <span className="ml-2 text-orange-500 text-sm font-semibold">
              (Due Soon)
            </span>
          ) : null}
        </>
      ) : (
        "Not set"
      ),
      icon: <CalendarIcon className="w-4 h-4 text-gray-500" />,
    },
    {
      label: "Current Status",
      value: currentTask.status,
      icon: getStatusIcon(currentTask.status),
    },
    ...(currentTask.created_at
      ? [
          {
            label: "Created",
            value: formatDateTime(currentTask.created_at),
            icon: <PlayIcon className="w-4 h-4 text-gray-500" />,
          },
        ]
      : []),
    ...(currentTask.updated_at &&
    currentTask.updated_at !== currentTask.created_at
      ? [
          {
            label: "Last Updated",
            value: formatDateTime(currentTask.updated_at),
            icon: <ClockIcon className="w-4 h-4 text-gray-500" />,
          },
        ]
      : []),
  ];

  return (
    <DetailPageLayout
      loading={loading}
      item={task}
      title="Task Details"
      subtitle={`Task #${task?.id?.slice(-8)}`}
      onBack={() => navigate("/tasks")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Tasks"
    >
      <HeroSection
        title={currentTask.title}
        status={{
          value: currentTask.status,
          color: getStatusColor(currentTask.status),
          icon: getStatusIcon(currentTask.status),
        }}
        date={
          currentTask.due_date
            ? {
                label: "Due",
                value: `${formatDate(currentTask.due_date)} (${getDaysUntilDue(
                  currentTask.due_date
                )} days)`,
              }
            : undefined
        }
        gradient="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
        avatar={{
          icon: getStatusIcon(currentTask.status),
          className: `bg-${getStatusColor(
            currentTask.status
          )}-100 dark:bg-${getStatusColor(
            currentTask.status
          )}-900/20 text-${getStatusColor(currentTask.status)}`,
        }}
        actions={statusActions()}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {getProgressValue(currentTask.status)}%
            </span>
          </div>
          <Progress
            value={getProgressValue(currentTask.status)}
            color={getStatusColor(currentTask.status)}
            className="max-w-md"
          />
        </div>
      </HeroSection>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <DetailCard
            title="Task Description"
            icon={
              <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            }
            iconBgColor="bg-purple-100 dark:bg-purple-900/20"
            items={[]}
            content={
              currentTask.description ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {currentTask.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided for this task.
                  </p>
                </div>
              )
            }
          />

          <DetailCard
            title="Timeline & Details"
            icon={
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
            items={timelineItems}
          />
        </div>

        <SidebarActions actions={sidebarActions}>
          {currentTask.deal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Related Deal
                </h3>
              </div>
              <DealCard deal={currentTask.deal} />
            </div>
          )}
        </SidebarActions>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <ModalHeader className="text-xl font-bold">Edit Task</ModalHeader>
            <ModalBody className="space-y-6">
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Title"
                    placeholder="Enter task title"
                    isInvalid={!!errors.title}
                    errorMessage={errors.title?.message}
                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Description"
                    placeholder="Enter task description (optional)"
                    minRows={4}
                  />
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="deal_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Deal (Optional)"
                      placeholder="Select a deal"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] as string)
                      }
                      startContent={<BuildingOfficeIcon className="w-4 h-4" />}
                    >
                      {deals.map((deal) => (
                        <SelectItem key={deal.id}>{deal.title}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Status"
                      placeholder="Select status"
                      isInvalid={!!errors.status}
                      errorMessage={errors.status?.message}
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] as TaskStatus)
                      }
                    >
                      <SelectItem key="pending">Pending</SelectItem>
                      <SelectItem key="completed">Completed</SelectItem>
                      <SelectItem key="overdue">Overdue</SelectItem>
                    </Select>
                  )}
                />
              </div>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Due Date (Optional)"
                    startContent={<CalendarIcon className="w-4 h-4" />}
                  />
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Update Task
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </DetailPageLayout>
  );
};

export default TaskDetailPage;
