import { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Categories from '../components/Categories';
import AddCategoryModal from '../components/AddCategoryModal';
import ViewCategoryModal from '../components/ViewCategoryModal';
import { Category } from '../services/CategoryService';

const You: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>You</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">You</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <Categories
                    onCategoryClick={handleCategoryClick}
                    onAddClick={() => setIsAddModalOpen(true)}
                />
            </IonContent>
            <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ViewCategoryModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                category={selectedCategory}
            />
        </IonPage>
    );
};

export default You;
