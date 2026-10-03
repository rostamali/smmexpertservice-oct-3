import { systemPageMetadata } from '@/lib/seo';
import NotFoundView from '@/components/NotFoundView';

export const generateMetadata = () => systemPageMetadata('notFound', { title: '404 - Page Not Found', description: 'The page you are looking for could not be found.', noindex: true });

export default function NotFound() {
    return <NotFoundView />;
}
