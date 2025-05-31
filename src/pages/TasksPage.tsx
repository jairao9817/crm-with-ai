import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Textarea,
  DatePicker,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Badge,
} from "@heroui/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { TaskService } from "../services/taskService";
import { DealService } from "../services/dealService";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
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

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<TaskFormData>();

  useEffect(() => {
    loadTasks();
    loadDeals();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
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

  const onSubmit = async (data: TaskFormData) => {
    try {
      setSubmitting(true);
      const taskData: CreateTaskInput = {
        title: data.title,
        description: data.description,
        deal_id: data.deal_id || undefined,
        due_date: data.due_date || undefined,
        status: (data.status as any) || "pending",
      };

      await TaskService.createTask(taskData);
      await loadTasks();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: TaskFormData) => {
    if (!selectedTask) return;

    try {
      setSubmitting(true);
      const taskData: UpdateTaskInput = {
        title: data.title,
        description: data.description,
        deal_id: data.deal_id || undefined,
        due_date: data.due_date || undefined,
        status: (data.status as any) || selectedTask.status,
      };

      await TaskService.updateTask(selectedTask.id, taskData);
      await loadTasks();
      resetEdit();
      onEditClose();
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    resetEdit({
      title: task.title,
      description: task.description || "",
      deal_id: task.deal_id || "",
      due_date: task.due_date || "",
      status: task.status,
    });
    onEditOpen();
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await TaskService.deleteTask(taskId);
        await loadTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await TaskService.updateTaskStatus(taskId, newStatus);
      await loadTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckIcon className="w-4 h-4" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case "pending":
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const filteredTasks = tasks.filter((task) => {
    // Update overdue status
    if (isOverdue(task) && task.status === "pending") {
      task.status = "overdue";
    }
    return true;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks and track progress
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onOpen}
        >
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredTasks.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingTasks.length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {overdueTasks.length}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tasks..."
              startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1"
            />
            <Button
              variant={showFilters ? "solid" : "bordered"}
              startContent={<FunnelIcon className="w-4 h-4" />}
              onPress={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Select
                label="Status"
                placeholder="All statuses"
                selectedKeys={filters.status ? [filters.status] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    status: Array.from(keys)[0] as TaskStatus,
                  })
                }
              >
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="overdue">Overdue</SelectItem>
              </Select>

              <Select
                label="Deal"
                placeholder="All deals"
                selectedKeys={filters.deal_id ? [filters.deal_id] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    deal_id: Array.from(keys)[0] as string,
                  })
                }
              >
                {deals.map((deal) => (
                  <SelectItem key={deal.id}>{deal.title}</SelectItem>
                ))}
              </Select>

              <Input
                type="date"
                label="Due Date"
                value={filters.due_date || ""}
                onChange={(e) =>
                  setFilters({ ...filters, due_date: e.target.value })
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <Chip
                        color={getStatusColor(task.status)}
                        variant="flat"
                        size="sm"
                        startContent={getStatusIcon(task.status)}
                      >
                        {task.status}
                      </Chip>
                      {task.due_date && (
                        <Chip variant="bordered" size="sm">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </Chip>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}

                    {task.deal && (
                      <div className="flex items-center gap-2">
                        <Badge
                          content={task.deal.stage}
                          color="primary"
                          variant="flat"
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Deal: {task.deal.title}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key="edit" onPress={() => handleEdit(task)}>
                        Edit
                      </DropdownItem>
                      {task.status === "pending" && (
                        <DropdownItem
                          key="complete"
                          onPress={() =>
                            handleStatusChange(task.id, "completed")
                          }
                        >
                          Mark Complete
                        </DropdownItem>
                      )}
                      {task.status === "completed" && (
                        <DropdownItem
                          key="pending"
                          onPress={() => handleStatusChange(task.id, "pending")}
                        >
                          Mark Pending
                        </DropdownItem>
                      )}
                      <DropdownItem
                        key="delete"
                        onPress={() => handleDelete(task.id)}
                        className="text-danger"
                        color="danger"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card>
              <CardBody className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  No tasks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first task.
                </p>
                <Button color="primary" onPress={onOpen}>
                  Add Task
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Create New Task</ModalHeader>
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
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={field.value ? [field.value] : ["pending"]}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="completed">Completed</SelectItem>
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Create Task
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleEditSubmit(onEditSubmit)}>
            <ModalHeader>Edit Task</ModalHeader>
            <ModalBody className="space-y-4">
              <Controller
                name="title"
                control={editControl}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Title"
                    placeholder="Enter task title"
                    isInvalid={!!editErrors.title}
                    errorMessage={editErrors.title?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={editControl}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Description"
                    placeholder="Enter task description (optional)"
                  />
                )}
              />

              <Controller
                name="deal_id"
                control={editControl}
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
                control={editControl}
                render={({ field }) => (
                  <Input {...field} type="date" label="Due Date (Optional)" />
                )}
              />

              <Controller
                name="status"
                control={editControl}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
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

export default TasksPage;
