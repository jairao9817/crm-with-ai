import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { CommunicationNotesService } from "../services/communicationNotesService";
import type {
  CommunicationNote,
  CreateCommunicationNoteInput,
  UpdateCommunicationNoteInput,
  CommunicationNoteType,
} from "../types";

interface CommunicationNotesProps {
  communicationId: string;
  notes: CommunicationNote[];
  onNotesChange: () => void;
}

interface NoteFormData {
  note_content: string;
  note_type: CommunicationNoteType;
}

const NOTE_TYPES = [
  { key: "reply", label: "User Reply" },
  { key: "follow_up", label: "Follow Up" },
  { key: "general", label: "General Note" },
  { key: "important", label: "Important" },
];

const CommunicationNotes: React.FC<CommunicationNotesProps> = ({
  communicationId,
  notes,
  onNotesChange,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CommunicationNote | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<NoteFormData>({
    defaultValues: {
      note_content: "",
      note_type: "reply",
    },
  });

  const getTypeConfig = (type: CommunicationNoteType) => {
    const configs = {
      reply: {
        color: "primary" as const,
        icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
        label: "User Reply",
      },
      follow_up: {
        color: "secondary" as const,
        icon: <ArrowPathIcon className="w-4 h-4" />,
        label: "Follow Up",
      },
      general: {
        color: "default" as const,
        icon: <DocumentTextIcon className="w-4 h-4" />,
        label: "General Note",
      },
      important: {
        color: "warning" as const,
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
        label: "Important",
      },
    };
    return configs[type] || configs.general;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const handleAddNote = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      const noteData: CreateCommunicationNoteInput = {
        communication_id: communicationId,
        note_content: data.note_content,
        note_type: data.note_type,
      };

      await CommunicationNotesService.createNote(noteData);
      setIsAddModalOpen(false);
      reset();
      onNotesChange();
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async (data: NoteFormData) => {
    if (!editingNote) return;

    setIsSubmitting(true);
    try {
      const noteData: UpdateCommunicationNoteInput = {
        note_content: data.note_content,
        note_type: data.note_type,
      };

      await CommunicationNotesService.updateNote(editingNote.id, noteData);
      setIsEditModalOpen(false);
      setEditingNote(null);
      reset();
      onNotesChange();
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await CommunicationNotesService.deleteNote(noteId);
      onNotesChange();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const openEditModal = (note: CommunicationNote) => {
    setEditingNote(note);
    setValue("note_content", note.note_content);
    setValue("note_type", note.note_type);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingNote(null);
    reset();
  };

  return (
    <Card className="bg-surface border border-border">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-text-primary">
            Communication Notes
          </h3>
          <Chip size="sm" variant="flat" color="primary">
            {notes.length}
          </Chip>
        </div>
        <Button
          color="primary"
          size="sm"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => setIsAddModalOpen(true)}
        >
          Add Note
        </Button>
      </CardHeader>
      <CardBody>
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => {
              const config = getTypeConfig(note.note_type);
              return (
                <div
                  key={note.id}
                  className="p-4 rounded-lg bg-background border border-border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={config.color}
                        startContent={config.icon}
                      >
                        {config.label}
                      </Chip>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-gray-400"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="edit"
                          startContent={<PencilIcon className="w-4 h-4" />}
                          onPress={() => openEditModal(note)}
                        >
                          Edit Note
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<TrashIcon className="w-4 h-4" />}
                          color="danger"
                          onPress={() => handleDeleteNote(note.id)}
                        >
                          Delete Note
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <p className="text-text-secondary mb-3 whitespace-pre-wrap">
                    {note.note_content}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatDate(note.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-text-secondary italic">
              No notes added yet. Click "Add Note" to create your first note for
              this communication.
            </p>
          </div>
        )}
      </CardBody>

      {/* Add Note Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeModals}>
        <ModalContent>
          <form onSubmit={handleSubmit(handleAddNote)}>
            <ModalHeader>Add Communication Note</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="note_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Note Type"
                      placeholder="Select note type"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(
                          keys
                        )[0] as CommunicationNoteType;
                        field.onChange(value);
                      }}
                    >
                      {NOTE_TYPES.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="note_content"
                  control={control}
                  rules={{ required: "Note content is required" }}
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      label="Note Content"
                      placeholder="Enter your note about the user's reply or communication..."
                      minRows={4}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={closeModals}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                Add Note
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeModals}>
        <ModalContent>
          <form onSubmit={handleSubmit(handleEditNote)}>
            <ModalHeader>Edit Communication Note</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="note_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Note Type"
                      placeholder="Select note type"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(
                          keys
                        )[0] as CommunicationNoteType;
                        field.onChange(value);
                      }}
                    >
                      {NOTE_TYPES.map((type) => (
                        <SelectItem key={type.key} value={type.key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="note_content"
                  control={control}
                  rules={{ required: "Note content is required" }}
                  render={({ field, fieldState }) => (
                    <Textarea
                      {...field}
                      label="Note Content"
                      placeholder="Enter your note about the user's reply or communication..."
                      minRows={4}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={closeModals}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                Update Note
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default CommunicationNotes;
