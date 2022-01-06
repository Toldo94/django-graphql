import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/header';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import { gql } from '@apollo/client';
import client from '../api/apollo-client';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(0),
    borderRadius: '0',
  },
  paperImagePreview: {
    paddingTop: 30,
  },
  paperImage: {
    padding: theme.spacing(0),
    borderRadius: '0',
    marginLeft: 25,
    ['@media (max-width:600px)']: {
      marginLeft: -20,
      marginRight: -20,
    },
  },
  paperRight: {
    padding: theme.spacing(0),
    borderRadius: '0',
    paddingLeft: 40,
    paddingTop: 30,
    ['@media (max-width:600px)']: {
      paddingLeft: 0,
      paddingTop: 10,
    },
  },
  img: {
    maxWidth: '100%',
  },
}));

function Product({ data, categories }) {
  const classes = useStyles();
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Head>
        <title>{data.title}</title>
      </Head>
      <Header data={categories} />
      <Container maxWidth='md'>
        <Grid container spacing={0}>
          <Hidden only={['xs', 'sm']}>
            <Grid item sm={1}>
              <Paper className={classes.paperImagePreview} elevation={0}>
                {data.productImage.map((c) => (
                  <div key={c.id}>
                    <Paper className={classes.paperImage} elevation={0}>
                      <img
                        src={c.image}
                        alt={c.altText}
                        className={classes.img}
                      />
                    </Paper>
                  </div>
                ))}
              </Paper>
            </Grid>
          </Hidden>
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paperImage} elevation={0}>
              <img
                src={data.productImage[0].image}
                alt={data.productImage[0].altText}
                className={classes.img}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper className={classes.paperRight} elevation={0}>
              <Box component='h1' fontSize={18} fontWeight='400'>
                {data.title}
              </Box>
              <Box component='p' fontSize={22} fontWeight='900' m={0}>
                £{data.regularPrice}
              </Box>
              <Box component='p' m={0} fontSize={14}>
                Free Delivery & Returns (Ts&Cs apply)
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'boots-3' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const categoriesData = await client.query({
    query: gql`
      query AllCategories {
        allCategories {
          name
          slug
        }
      }
    `,
  });
  const PRODUCT_DETAILS = gql`
    query ProductDetails($slug: String!) {
      allProductsByName(slug: $slug) {
        id
        title
        description
        slug
        regularPrice
        productImage {
          id
          image
          altText
        }
      }
    }
  `;

  const { data } = await client.query({
    query: PRODUCT_DETAILS,
    variables: {
      slug: params.slug,
    },
  });

  return {
    props: {
      categories: categoriesData.data.allCategories,
      data: data.allProductsByName,
    },
  };
}

export default Product;
