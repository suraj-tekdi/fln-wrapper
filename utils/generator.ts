import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { SwayamCourse } from 'types/SwayamCourese';

export const swayamCatalogGenerator = (
  apiData: SwayamApiResponse,
  query: string,
) => {
  const courses: ReadonlyArray<{ node: SwayamCourse }> =
    apiData.data.courseList.edges;
  const providerWise = {};
  const categories = new Set();

  courses.forEach((course) => {
    const item = course.node;
    const provider = item.ncCode;
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }

    // getting categories
    categories.add(
      item.category[0].name
        ? {
          id: item.category[0].name,
          parent_category_id: item.category[0].name,
          descriptor: {
            name: item.category[0].name,
          },
        }
        : {
          id: 'OTHERS',
          parent_category_id: 'OTHERS',
          descriptor: {
            name: 'OTHERS',
          },
        },
    );
  });

  const catalog = {};
  catalog['descriptor'] = { name: `Catalog for ${query}` };

  // adding providers
  catalog['providers'] = Object.keys(providerWise).map((provider: string) => {
    const providerObj: components['schemas']['Provider'] = {
      id: provider,
      descriptor: {
        name: provider,
      },
      categories: Array.from(categories),

      items: providerWise[provider].map((course: SwayamCourse) => {
        const providerItem = {
          id: course.id,
          parent_item_id: course.id,
          descriptor: {
            name: course.title,
            long_desc: course.explorerSummary ? course.explorerSummary : '',
            images: [{ url: encodeURI(course.coursePictureUrl) }],
          },
          price: {
            currency: 'INR',
            value: 0 + '', // map it to an actual response
          },
          category_id: course.category[0].name,
          recommended: course.featured ? true : false,
          time: {
            label: 'Course Schedule',
            duration: `P${course.weeks}W`, // ISO 8601 duration format
            range: {
              start: course.startDate.toString(),
              end:
                course.endDate.toString() === ''
                  ? course.startDate.toString()
                  : course.endDate.toString(),
            },
          },
          rating: '0', // map it to an actual response
          tags: [
            {
              name: 'credits',
              value: course.credits + '',
            },
            {
              name: 'instructors',
              value: course.explorerInstructorName,
            },
            {
              name: 'offeringInstitue',
              value: course.instructorInstitute,
            },
            {
              name: 'url',
              value: course.url,
            },
            {
              name: 'enrollmentEndDate',
              value: course.enrollmentEndDate.toString(),
            },
          ],
          rateable: true,
        };
        return providerItem;
      }),
    };
    return providerObj;
  });

  return catalog;
};

export const generateOrder = (
  action: string,
  message_id: string,
  item: any,
  providerId: string,
  providerDescriptor: any,
  categoryId: string,
) => {
  const order = {
    id: message_id + Date.now(),
    ref_order_ids: [],
    state: action === 'confirm' ? 'COMPLETE' : 'ACTIVE',
    type: 'DRAFT',
    provider: {
      id: providerId,
      descriptor: providerDescriptor,
      category_id: categoryId,
    },
    items: [item],
    fulfillments: {
      id: '',
      type: 'ONLINE',
      tracking: false,
      customer: {},
      agent: {},
      contact: {},
    },
    created_at: new Date(Date.now()),
    updated_at: new Date(Date.now()),
    tags: [
      {
        display: true,
        name: 'order tags',
        list: [
          {
            name: 'tag_name',
            value: 'value of the key in name',
            display: true,
          },
        ],
      },
    ],
  };

  return order;
};
