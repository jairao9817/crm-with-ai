import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Textarea } from "@heroui/react";
import { useContacts } from "../hooks/useContacts";
import type { Contact, CreateContactInput, UpdateContactInput } from "../types";

const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSuccess,
  onCancel,
}) => {
  const { createContact, updateContact, checkDuplicate } = useContacts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
    },
  });

  // Reset form when contact prop changes
  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || "",
        company: contact.company || "",
        job_title: contact.job_title || "",
      });
    } else {
      reset();
    }
  }, [contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      clearErrors();

      // Check for duplicate email
      const isDuplicate = await checkDuplicate(data.email, contact?.id);
      if (isDuplicate) {
        setError("email", {
          message: "A contact with this email already exists",
        });
        return;
      }

      if (contact) {
        // Update existing contact
        const updateData: UpdateContactInput = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          company: data.company || undefined,
          job_title: data.job_title || undefined,
        };
        await updateContact(contact.id, updateData);
      } else {
        // Create new contact
        const createData: CreateContactInput = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          company: data.company || undefined,
          job_title: data.job_title || undefined,
        };
        await createContact(createData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save contact:", error);
      setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to save contact",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <Input
        label="Full Name"
        placeholder="Enter contact's full name"
        isRequired
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        {...register("name")}
      />

      {/* Email Field */}
      <Input
        label="Email Address"
        placeholder="Enter email address"
        type="email"
        isRequired
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
        {...register("email")}
      />

      {/* Phone Field */}
      <Input
        label="Phone Number"
        placeholder="Enter phone number"
        type="tel"
        isInvalid={!!errors.phone}
        errorMessage={errors.phone?.message}
        {...register("phone")}
      />

      {/* Company Field */}
      <Input
        label="Company"
        placeholder="Enter company name"
        isInvalid={!!errors.company}
        errorMessage={errors.company?.message}
        {...register("company")}
      />

      {/* Job Title Field */}
      <Input
        label="Job Title"
        placeholder="Enter job title"
        isInvalid={!!errors.job_title}
        errorMessage={errors.job_title?.message}
        {...register("job_title")}
      />

      {/* Error Message */}
      {errors.root && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm">{errors.root.message}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button variant="light" onPress={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" color="primary" isLoading={isSubmitting}>
          {contact ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </form>
  );
};
