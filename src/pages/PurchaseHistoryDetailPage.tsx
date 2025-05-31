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
  Badge,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import type {
  PurchaseHistory,
  UpdatePurchaseHistoryInput,
  Contact,
  Deal,
  PurchaseStatus,
} from "../types";

interface PurchaseFormData {
  contact_id: string;
  deal_id?: string;
  date: string;
  amount: number;
  product_service: string;
  status: PurchaseStatus;
}

const PurchaseHistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<PurchaseHistory | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
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
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>();

  const selectedContactId = watch("contact_id");

  useEffect(() => {
    if (id) {
      loadPurchase();
      loadContacts();
      loadDeals();
    }
  }, [id]);

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const data = await PurchaseHistoryService.getPurchaseHistoryRecord(id!);
      if (data) {
        setPurchase(data);
      } else {
        navigate("/purchase-history");
      }
    } catch (error) {
      console.error("Failed to load purchase:", error);
      navigate("/purchase-history");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await ContactService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
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
    if (!purchase) return;

    reset({
      contact_id: purchase.contact_id,
      deal_id: purchase.deal_id || "",
      date: new Date(purchase.date).toISOString().split("T")[0],
      amount: purchase.amount,
      product_service: purchase.product_service,
      status: purchase.status,
    });
    onEditOpen();
  };

  const onEditSubmit = async (data: PurchaseFormData) => {
    if (!purchase) return;

    try {
      setSubmitting(true);
      const purchaseData: UpdatePurchaseHistoryInput = {
        contact_id: data.contact_id,
        deal_id: data.deal_id || undefined,
        date: data.date,
        amount: data.amount,
        product_service: data.product_service,
        status: data.status,
      };

      await PurchaseHistoryService.updatePurchaseHistory(
        purchase.id,
        purchaseData
      );
      await loadPurchase();
      onEditClose();
    } catch (error) {
      console.error("Failed to update purchase:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!purchase) return;

    if (
      window.confirm("Are you sure you want to delete this purchase record?")
    ) {
      try {
        await PurchaseHistoryService.deletePurchaseHistory(purchase.id);
        navigate("/purchase-history");
      } catch (error) {
        console.error("Failed to delete purchase:", error);
      }
    }
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "pending":
        return <ClockIcon className="w-5 h-5" />;
      case "refunded":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ShoppingCartIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "danger";
      default:
        return "default";
    }
  };

  const getContactDeals = (contactId: string) => {
    return deals.filter((deal) => deal.contact_id === contactId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Purchase record not found
        </h2>
        <Button
          color="primary"
          onPress={() => navigate("/purchase-history")}
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Purchase History
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            isIconOnly
            onPress={() => navigate("/purchase-history")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Purchase Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(purchase.date)}
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

      {/* Purchase Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <ShoppingCartIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {purchase.product_service}
                    </h2>
                    <Chip
                      color={getStatusColor(purchase.status)}
                      variant="flat"
                      size="sm"
                      startContent={getStatusIcon(purchase.status)}
                    >
                      {purchase.status}
                    </Chip>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(purchase.amount)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Product/Service Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {purchase.product_service}
                  </p>
                </div>

                {purchase.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Notes
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {purchase.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Customer
              </h3>
            </CardHeader>
            <CardBody>
              {purchase.contact ? (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {purchase.contact.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {purchase.contact.email}
                  </p>
                  {purchase.contact.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {purchase.contact.phone}
                    </p>
                  )}
                  {purchase.contact.company && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Company:</strong> {purchase.contact.company}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Customer information not available
                </p>
              )}
            </CardBody>
          </Card>

          {/* Deal Information */}
          {purchase.deal && (
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
                    {purchase.deal.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      content={purchase.deal.stage}
                      color="primary"
                      variant="flat"
                    />
                    <span className="text-lg font-semibold text-success">
                      {formatCurrency(purchase.deal.value)}
                    </span>
                  </div>
                  {purchase.deal.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {purchase.deal.description}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Purchase Metadata */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Purchase Details
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Purchase Date
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(purchase.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </span>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(purchase.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(purchase.status)}
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {purchase.status}
                    </p>
                  </div>
                </div>

                {purchase.created_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Record Created
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(purchase.created_at)}
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
            <ModalHeader>Edit Purchase Record</ModalHeader>
            <ModalBody className="space-y-4">
              <Controller
                name="contact_id"
                control={control}
                rules={{ required: "Contact is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Contact"
                    placeholder="Select a contact"
                    isInvalid={!!errors.contact_id}
                    errorMessage={errors.contact_id?.message}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </Select>
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
                    {getContactDeals(selectedContactId).map((deal) => (
                      <SelectItem key={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="product_service"
                control={control}
                rules={{ required: "Product/Service is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Product/Service"
                    placeholder="Enter product or service name"
                    isInvalid={!!errors.product_service}
                    errorMessage={errors.product_service?.message}
                  />
                )}
              />

              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be positive" },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Amount"
                    placeholder="0.00"
                    startContent="$"
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                )}
              />

              <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Purchase Date"
                    isInvalid={!!errors.date}
                    errorMessage={errors.date?.message}
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
                      field.onChange(Array.from(keys)[0] as PurchaseStatus)
                    }
                  >
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Update Purchase
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PurchaseHistoryDetailPage;
