import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  title?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  title = "Contact",
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          {title}
        </h3>
      </CardHeader>
      <CardBody>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {contact.name}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {contact.email}
          </p>
          {contact.phone && (
            <p className="text-gray-600 dark:text-gray-400">{contact.phone}</p>
          )}
          {contact.company && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              <strong>Company:</strong> {contact.company}
            </p>
          )}
          {contact.job_title && (
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Title:</strong> {contact.job_title}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ContactCard;
