import Link from "next/link";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  link: string;
  description: string;
}

const DashboardCard = ({
  title,
  icon,
  link,
  description,
}: DashboardCardProps) => {
  return (
    <Link href={link}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 h-full">
        <div className="flex items-start mb-3">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">{icon}</div>
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard;
