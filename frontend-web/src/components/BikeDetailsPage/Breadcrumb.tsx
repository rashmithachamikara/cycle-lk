import { Breadcrumb as UIBreadcrumb } from '../../ui';

interface BreadcrumbProps {
  bikeName: string;
}

const Breadcrumb = ({ bikeName }: BreadcrumbProps) => {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Locations', href: '/locations' },
    { label: bikeName, active: true }
  ];

  return <UIBreadcrumb items={breadcrumbItems} />;
};

export default Breadcrumb;
