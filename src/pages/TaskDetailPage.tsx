import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
  Badge,
  Avatar,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
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
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>();

  useEffect(() => {
    if (id) {
      loadTask();
      loadDeals();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getTask(id!);
      if (data) {
        setTask(data);
      } else {
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Failed to load task:", error);
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

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
    if (!task) return;

    try {
      setSubmitting(true);
      const taskData: UpdateTaskInput = {
        title: data.title,
        description: data.description,
        deal_id: data.deal_id || undefined,
        due_date: data.due_date || undefined,
        status: data.status,
      };

      await TaskService.updateTask(task.id, taskData);
      await loadTask();
      onEditClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await TaskService.deleteTask(task.id);
        navigate("/tasks");
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      await TaskService.updateTaskStatus(task.id, newStatus);
      await loadTask();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Task not found
        </h2>
        <Button
          color="primary"
          onPress={() => navigate("/tasks")}
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Tasks
        </Button>
      </div>
    );
  }

  // Update status if overdue
  if (isOverdue(task) && task.status === "pending") {
    task.status = "overdue";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="light" isIconOnly onPress={() => navigate("/tasks")}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Task Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {task.due_date
                ? `Due: ${formatDate(task.due_date)}`
                : "No due date"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            variant="light"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={handleEdit}
          >
            Edit
          </Button>
          <Button
            color="danger"
            variant="light"
            startContent={<TrashIcon className="w-4 h-4" />}
            onPress={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar
                    icon={getStatusIcon(task.status)}
                    className={`bg-${getStatusColor(
                      task.status
                    )}-100 text-${getStatusColor(task.status)}`}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h2>
                    <Chip
                      color={getStatusColor(task.status)}
                      variant="flat"
                      size="sm"
                      startContent={getStatusIcon(task.status)}
                    >
                      {task.status}
                    </Chip>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2">
                  {task.status === "pending" && (
                    <Button
                      color="success"
                      size="sm"
                      startContent={<CheckIcon className="w-4 h-4" />}
                      onPress={() => handleStatusChange("completed")}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {task.status === "completed" && (
                    <Button
                      color="warning"
                      size="sm"
                      startContent={<ClockIcon className="w-4 h-4" />}
                      onPress={() => handleStatusChange("pending")}
                    >
                      Mark Pending
                    </Button>
                  )}
                  {task.status === "overdue" && (
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
              {task.description ? (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {task.description}
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
          {task.deal && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5" />
                  Associated Deal
                </h3>
              </CardHeader>
              <CardBody>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {task.deal.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      content={task.deal.stage}
                      color="primary"
                      variant="flat"
                    />
                    <span className="text-lg font-semibold text-success">
                      ${task.deal.value?.toLocaleString()}
                    </span>
                  </div>
                  {task.deal.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {task.deal.description}
                    </p>
                  )}
                  {task.deal.contact && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Contact
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.deal.contact.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.deal.contact.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

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
                      {task.due_date ? formatDate(task.due_date) : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {task.status}
                    </p>
                  </div>
                </div>

                {task.created_at && (
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(task.created_at)}
                      </p>
                    </div>
                  </div>
                )}

                {task.updated_at && task.updated_at !== task.created_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDateTime(task.updated_at)}
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
                  <Input {...field} type="date" label="Due Date (Optional)" />
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
    </div>
  );
};

export default TaskDetailPage;
