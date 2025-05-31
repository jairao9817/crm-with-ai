import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Avatar,
} from "@heroui/react";
import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
import { useDetailPage } from "../hooks/useDetailPage";
import DetailPageLayout from "../components/DetailPageLayout";
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
      // Reload the task data after status change
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
      case "pending":
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
      case "pending":
      default:
        return "warning";
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Update status if overdue
  const currentTask =
    task && isOverdue(task) && task.status === "pending"
      ? { ...task, status: "overdue" as TaskStatus }
      : task;

  return (
    <DetailPageLayout
      loading={loading}
      item={task}
      title="Task Details"
      subtitle={
        task?.due_date ? `Due: ${formatDate(task.due_date)}` : "No due date"
      }
      onBack={() => navigate("/tasks")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Tasks"
    >
      {currentTask && (
        <>
          {/* Task Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar
                        icon={getStatusIcon(currentTask.status)}
                        className={`bg-${getStatusColor(
                          currentTask.status
                        )}-100 text-${getStatusColor(currentTask.status)}`}
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {currentTask.title}
                        </h2>
                        <Chip
                          color={getStatusColor(currentTask.status)}
                          variant="flat"
                          size="sm"
                          startContent={getStatusIcon(currentTask.status)}
                        >
                          {currentTask.status}
                        </Chip>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2">
                      {currentTask.status === "pending" && (
                        <Button
                          color="success"
                          size="sm"
                          startContent={<CheckIcon className="w-4 h-4" />}
                          onPress={() => handleStatusChange("completed")}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {currentTask.status === "completed" && (
                        <Button
                          color="warning"
                          size="sm"
                          startContent={<ClockIcon className="w-4 h-4" />}
                          onPress={() => handleStatusChange("pending")}
                        >
                          Mark Pending
                        </Button>
                      )}
                      {currentTask.status === "overdue" && (
                        <Button
                          color="success"
                          size="sm"
                          startContent={<CheckIcon className="w-4 h-4" />}
                          onPress={() => handleStatusChange("completed")}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  {currentTask.description ? (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {currentTask.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No description provided for this task.
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Information */}
              {currentTask.deal && <DealCard deal={currentTask.deal} />}

              {/* Task Metadata */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Task Details
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Due Date
                        </span>
                        <p className="text-gray-900 dark:text-white">
                          {currentTask.due_date
                            ? formatDate(currentTask.due_date)
                            : "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(currentTask.status)}
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {currentTask.status}
                        </p>
                      </div>
                    </div>

                    {currentTask.created_at && (
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Created
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {formatDateTime(currentTask.created_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {currentTask.updated_at &&
                      currentTask.updated_at !== currentTask.created_at && (
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Last Updated
                          </span>
                          <p className="text-gray-900 dark:text-white">
                            {formatDateTime(currentTask.updated_at)}
                          </p>
                        </div>
                      )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Edit Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
            <ModalContent>
              <form onSubmit={handleSubmit(onEditSubmit)}>
                <ModalHeader>Edit Task</ModalHeader>
                <ModalBody className="space-y-4">
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
                        minRows={3}
                      />
                    )}
                  />

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
                      >
                        {deals.map((deal) => (
                          <SelectItem key={deal.id}>{deal.title}</SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        label="Due Date (Optional)"
                      />
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
        </>
      )}
    </DetailPageLayout>
  );
};

export default TaskDetailPage;
