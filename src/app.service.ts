import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getCoursesFromSwayam() {
    try {
      const resp = await lastValueFrom(
        this.httpService
          .get('https://swayam.gov.in/modules/gql/query', {
            params: {
              q: `{
                courseList(
                  args: {
                    includeClosed: false
                    filterText: ""
                    category: "Humanities_and_Arts,Anthropology,Arts,Communications,Economics,English,Geography,History,Humanities_and_Social_Sciences,Journalism_(mass_media),Language,Linguistics,Philosophy,Political_Science,Sociology"
                    status: "Upcoming"
                    tags: ""
                    duration: "all"
                    examDate: "all"
                    credits: "all"
                    ncCode: "all"
                    courseType: "all"
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
              `,
              expanded_gcb_tags: 'gcb-markdown',
            },
          })
          .pipe(map((item) => item.data)),
      );

      console.log('returned courses are: ', resp.substr(4));
      return JSON.parse(resp.substr(4));
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }
}
