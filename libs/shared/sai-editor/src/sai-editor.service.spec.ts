import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SmartScripts } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { SaiCommentGeneratorService } from './sai-comment-generator.service';
import { SaiEditorService } from './sai-editor.service';
import { SaiHandlerService } from './sai-handler.service';

describe('SAI Editor Service', () => {
  let service: SaiEditorService;
  let handlerService: SaiHandlerService;
  let queryService: MysqlQueryService;
  let saiCommentGeneratorService: SaiCommentGeneratorService;

  const mockQuery = '-- Mock Query result';

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: SaiCommentGeneratorService, useValue: instance(mock(SaiCommentGeneratorService)) },
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(SaiEditorService);
    handlerService = TestBed.inject(SaiHandlerService);
    queryService = TestBed.inject(MysqlQueryService);
    saiCommentGeneratorService = TestBed.inject(SaiCommentGeneratorService);
  });

  it('checks linked event', () => {
    const mockRows: Partial<SmartScripts>[] = [
      { entryorguid: 0, source_type: 0, id: 0, link: 1, event_type: 0 },
      { entryorguid: 0, source_type: 0, id: 1, link: 0, event_type: 61 },
    ];

    service['_newRows'] = mockRows as SmartScripts[];
    expect(service.errors.length).toBe(0);
    expect(service.errorLinkedEvent).toBe(false);

    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(0);
    expect(service.errorLinkedEvent).toBe(false);

    mockRows[1].event_type = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(1);
    expect(service.errors[0]).toContain(`ERROR: the SAI (id: `);
    expect(service.errorLinkedEvent).toBe(true);

    mockRows[1].link = 3;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(2);
    expect(service.errors[1]).toContain(`ERROR: non-existing links:`);

    mockRows[0].link = 0;
    mockRows[1].link = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(0);
  });

  describe('when templateQuery is null', () => {
    beforeEach(() => {
      handlerService['_templateQuery'] = null as any;
    });

    it('updateFullQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getFullDeleteInsertQuery').and.returnValue(mockQuery);

      service['updateFullQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_fullQuery']).toEqual(mockQuery);
    });

    it('updateDiffQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(mockQuery);

      service['updateDiffQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_diffQuery']).toEqual(mockQuery);
    });
  });

  describe('when templateQuery is defined', () => {
    const mockTemplateQuery = '-- Mock Template Query result';
    const expectedQuery = `${mockTemplateQuery}\n\n${mockQuery}`;

    beforeEach(() => {
      handlerService['_templateQuery'] = mockTemplateQuery;
    });

    it('updateFullQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getFullDeleteInsertQuery').and.returnValue(mockQuery);

      service['updateFullQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_fullQuery']).toEqual(expectedQuery);
    });

    it('updateDiffQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(mockQuery);

      service['updateDiffQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_diffQuery']).toEqual(expectedQuery);
    });
  });

  describe('generateComments', () => {
    it('should work correctly generating comments in all rows', fakeAsync(() => {
      const mockRows: Partial<SmartScripts>[] = [
        { entryorguid: 0, source_type: 0, id: 0, link: 1, event_type: 0 },
        { entryorguid: 0, source_type: 0, id: 1, link: 0, event_type: 61 },
      ];

      service['_newRows'] = mockRows as SmartScripts[];

      const updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      const updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
      const refreshDatatableSpy = spyOn(service, 'refreshDatatable');
      const isRowSelectedSpy = spyOn(service, 'isRowSelected').and.returnValue(true);
      const getNameSpy = spyOn<any>(handlerService, 'getName');
      const generateCommentSpy = spyOn<any>(saiCommentGeneratorService, 'generateComment');

      service.generateComments(true);
      tick(100);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(refreshDatatableSpy).toHaveBeenCalledTimes(1);
      expect(isRowSelectedSpy).toHaveBeenCalledTimes(2);
      expect(getNameSpy).toHaveBeenCalledTimes(2);
      expect(generateCommentSpy).toHaveBeenCalledTimes(2);
    }));

    it('should work correctly generating only one comment', fakeAsync(() => {
      const mockRows: Partial<SmartScripts>[] = [
        { entryorguid: 0, source_type: 0, id: 0, link: 1, event_type: 0 },
        { entryorguid: 0, source_type: 0, id: 1, link: 0, event_type: 61 },
      ];

      service['_newRows'] = mockRows as SmartScripts[];

      const updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      const updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
      const refreshDatatableSpy = spyOn(service, 'refreshDatatable');
      const isRowSelectedSpy = spyOn(service, 'isRowSelected').and.returnValue(true);
      const getNameSpy = spyOn<any>(handlerService, 'getName');
      const generateCommentSpy = spyOn<any>(saiCommentGeneratorService, 'generateComment');

      service.generateComments();
      tick(100);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(refreshDatatableSpy).toHaveBeenCalledTimes(1);
      expect(isRowSelectedSpy).toHaveBeenCalledTimes(1);
      expect(getNameSpy).toHaveBeenCalledTimes(1);
      expect(generateCommentSpy).toHaveBeenCalledTimes(1);
    }));
  });
});
