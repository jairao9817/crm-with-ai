import { supabase } from "../lib/supabase";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "../types";

export class TaskService {
  // Get all tasks for the current user
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = supabase
      .from("tasks")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply status filter
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    // Apply deal filter
    if (filters?.deal_id) {
      query = query.eq("deal_id", filters.deal_id);
    }

    // Apply due date filter
    if (filters?.due_date) {
      query = query.eq("due_date", filters.due_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  }

  // Get a single task by ID
  static async getTask(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Task not found
      }
      throw new Error(`Failed to fetch task: ${error.message}`);
    }

    return data;
  }

  // Create a new task
  static async createTask(taskData: CreateTaskInput): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...taskData,
        user_id: user.id,
      })
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  }

  // Update an existing task
  static async updateTask(
    id: string,
    taskData: UpdateTaskInput
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update(taskData)
      .eq("id", id)
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  }

  // Delete a task
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // Get tasks by deal ID
  static async getTasksByDeal(dealId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tasks for deal: ${error.message}`);
    }

    return data || [];
  }

  // Update task status
  static async updateTaskStatus(id: string, status: string): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }

    return data;
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .lt("due_date", today)
      .eq("status", "pending")
      .order("due_date", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch overdue tasks: ${error.message}`);
    }

    return data || [];
  }

  // Get tasks due today
  static async getTasksDueToday(): Promise<Task[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          contact:contacts(
            id,
            name,
            email,
            company
          )
        )
      `
      )
      .eq("due_date", today)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tasks due today: ${error.message}`);
    }

    return data || [];
  }

  // Get task statistics
  static async getTaskStats(): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  }> {
    try {
      const [allTasks, overdueTasks] = await Promise.all([
        this.getTasks(),
        this.getOverdueTasks(),
      ]);

      const completedTasks = allTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const pendingTasks = allTasks.filter(
        (task) => task.status === "pending"
      ).length;

      return {
        totalTasks: allTasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks: overdueTasks.length,
      };
    } catch (error) {
      console.error("Error fetching task stats:", error);
      throw new Error("Failed to fetch task statistics");
    }
  }
}
