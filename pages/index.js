import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import ResourceListWithProducts from '../components/ResourceList';
import axios from 'axios';


const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class Index extends React.Component {
  
  state = {
    open: false,
    sliderProducts: []
  };
  
  render() {
    const emptyState = this.state.sliderProducts == null || this.state.sliderProducts.length == 0;
    return (
      <Page
        primaryAction={{
          content: 'Select products',
          onAction: () => this.setState({ open: true }),
        }}
      >
        <ResourcePicker
          resourceType="Product"
          showVariants={false}
          open={this.state.open}
          onSelection={(resources) => this.handleSelection(resources)}
          onCancel={() => this.setState({ open: false })}
        />
        {emptyState ? (
          <Layout>
            <EmptyState
              heading="Select your products for the slider"
              action={{
                content: 'Select products',
                onAction: () => this.setState({ open: true }),
              }}
              image={img}
            >
              <p>Select products to show in the slider.</p>
            </EmptyState>
          </Layout>
        ) : (
            <ResourceListWithProducts sliderProducts={this.state.sliderProducts} removeProductsFromSliderFunction={this.removeProductsFromSlider} />
          )}
      </Page>
    );
  }

  async componentDidMount() {
    this.getSliderProducts();
  }

  getSliderProducts = async () => {
    axios({
      url: '/get-slider-products',
      method: 'GET'
    })
    .then(res => {
      this.setState({sliderProducts: res.data});
    });
  }

  handleSelection = async (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    this.setState({ open: false });

    await axios({
        url: '/add-slider-products',
        data: idsFromResources,
        method: 'POST'
    })
    .then(res => {
      this.getSliderProducts();
    });
  };

  removeProductsFromSlider = async ( productIds ) => {
    await axios({
      url: '/remove-slider-products',
      data: productIds,
      method: 'DELETE'
    })
    .then(res => {
      this.getSliderProducts();
    });
  }
}

export default Index;