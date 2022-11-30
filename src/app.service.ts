import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getCoursesFromSwayam(body: any) {
    const {
      provider,
      courseMode,
      courseDuration,
      courseCredits,
      courseCategory,
      query,
    } = body;

    const gql = `{
      courseList(
        args: {
          includeClosed: false
          filterText: ${query ? '"' + query + '"' : '""'}
          category: ${courseCategory ? '"' + courseCategory + '"' : '""'}
          status: "Upcoming"
          tags: ""
          duration: ${courseDuration ? '"' + courseDuration + '"' : '"all"'}
          examDate: "all"
          credits: ${courseCredits === 'N'
        ? '"false"'
        : courseCredits === 'Y'
          ? '"true"'
          : '"all"'
      }
          ncCode: ${provider ? '"' + provider + '"' : '"all"'}
          courseType: ${courseMode ? '"' + courseMode + '"' : '"all"'}
        }
        first: 100
      ) {
        edges {
          node {
            id
            title
            url
            explorerSummary
            explorerInstructorName
            enrollment {
              enrolled
            }
            openForRegistration
            showInExplorer
            startDate
            endDate
            examDate
            enrollmentEndDate
            estimatedWorkload
            category {
              name
              category
              parentId
            }
            tags {
              name
            }
            featured
            coursePictureUrl
            credits
            weeks
            nodeCode
            instructorInstitute
            ncCode
            semester
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      examDates {
        date
      }
    }
    `;
    console.log('gql', gql);
    try {
      const resp = await lastValueFrom(
        this.httpService
          .get('https://swayam.gov.in/modules/gql/query', {
            params: {
              q: gql,
              expanded_gcb_tags: 'gcb-markdown',
            },
          })
          .pipe(map((item) => item.data)),
      );

      console.log(
        'returned courses are: ',
        JSON.parse(resp.substr(4)).data.courseList,
      );
      return JSON.parse(resp.substr(4));
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }
}
