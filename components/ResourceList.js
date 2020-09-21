import React from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Stack,
  TextStyle,
  Avatar,
  Thumbnail,
} from '@shopify/polaris';

class ResourceListWithProducts extends React.Component {
  
  state = {
    selectedProductIds: []
  };
  
  resolveItemIds = ({ id }) => {
    return id;
  }

  setSelectedItems = (selectedItems) => {
    this.setState({ selectedProductIds: selectedItems });
  }

  render() {
    const promotedBulkActions = [
      {
        content: 'Remove products',
        onAction: () => this.props.removeProductsFromSliderFunction(this.state.selectedProductIds),
      },
    ];

    return (
      <Card>
        <ResourceList
          selectable
          resourceName={{ singular: 'Product', plural: 'Products' }}
          items={this.props.sliderProducts}
          selectedItems={this.state.selectedProductIds}
          onSelectionChange={this.setSelectedItems}
          promotedBulkActions={promotedBulkActions}
          resolveItemId={this.resolveItemIds}
          renderItem={(item) => {
            const media = (
              <Thumbnail
                source={
                  item.imageSrc
                    ? item.imageSrc
                    : ''
                }
                alt={
                  item.altText
                    ? item.altText
                    : ''
                }
              />
            );

            return (
              <ResourceItem
                id={item.id}
                media={media}
                accessibilityLabel={`View details for ${item.title}`}                
              >
                <Stack>
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">
                        {item.title}
                      </TextStyle>
                    </h3>
                  </Stack.Item>
                  <Stack.Item>
                    <p>{item.price} </p>
                  </Stack.Item>
                </Stack>
              </ResourceItem>
            );
          }}
        />
      </Card>
    );
  }

}

export default ResourceListWithProducts;