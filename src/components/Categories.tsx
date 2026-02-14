import { useState, useEffect } from 'react';
import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonList,
    IonListHeader,
    IonLabel,
    IonButton,
    IonItem,
    IonAvatar,
} from '@ionic/react';
import { Category, CategoryService, categoryIcons } from '../services/CategoryService';

interface CategoriesProps {
    onCategoryClick?: (category: Category) => void;
    onAddClick?: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ onCategoryClick, onAddClick }) => {
    const [categories, setCategories] = useState<Category[]>(CategoryService.getAll());

    useEffect(() => {
        const unsubscribe = CategoryService.subscribe(() => {
            setCategories(CategoryService.getAll());
        });
        return unsubscribe;
    }, []);

    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>Categories</strong></h2></IonLabel>
                <IonButton onClick={onAddClick}>Add</IonButton>
            </IonListHeader>
            {categories.length === 0 ? (
                <IonCardContent className="ion-text-center ion-padding">
                    <h3>No categories yet</h3>
                    <p>Start adding categories to organize your transactions.</p>
                </IonCardContent>
            ) : (
                <IonList>
                    {categories.map((cat) => (
                        <IonItem
                            key={cat.id}
                            button
                            detail
                            onClick={() => onCategoryClick?.(cat)}
                        >
                            <IonAvatar slot="start" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--ion-background-color-step-200)',
                            }}>
                                <IonIcon icon={categoryIcons[cat.icon]} />
                            </IonAvatar>
                            <IonLabel>
                                <h3>{cat.name}</h3>
                                <p>{cat.description}</p>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            )}
        </IonCard>
    );
};

export default Categories;
