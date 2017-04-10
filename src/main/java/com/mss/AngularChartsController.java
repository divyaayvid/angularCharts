package com.mss;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import jxl.Workbook;
import jxl.format.Colour;
import jxl.read.biff.BiffException;
import jxl.write.Label;
import jxl.write.WritableCellFormat;
import jxl.write.WritableFont;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;

@RestController
public class AngularChartsController {
	Connection con = null;
	PreparedStatement pstatement = null;
	ResultSet result = null;
	
	
	@GetMapping("/angChart")
	public ModelAndView showCharts(){
		return new ModelAndView("SideMenu.html");
	}    
    @GetMapping("/getStoreList")
    public List getStoreList(HttpServletRequest request,
			HttpServletResponse response) throws SQLException {
    	ArrayList storeList = new ArrayList();
    	try {
			Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root", "Divya@126");
			String query = "SELECT DISTINCT(sn.NAME) AS store_name FROM wf_ship_node sn";
			System.out.println("query..." + query);
			pstatement = con.prepareStatement(query);
			result = pstatement.executeQuery();	
			while (result.next()) {
	                storeList.add(result.getString("store_name"));
	            }
		}
		catch(Exception e){
			e.printStackTrace();
		}

    	return storeList;
    }
	@GetMapping("/chartData")
	public ArrayList getPieChartData(HttpServletRequest request,
			HttpServletResponse response) throws SQLException {
		String resultString ="";
		ArrayList<AngularChartsData> l = new ArrayList<AngularChartsData>();
		String storeName = request.getParameter("storeName");
		String startDate = request.getParameter("startDate");
		String endDate = request.getParameter("endDate");
		
	    System.out.println("------------"+storeName+"---------------");
		try {
			Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root", "Divya@126");
			String query = "SELECT COUNT(o.order_type) AS order_count,o.order_type AS order_type,"
					+ "o.order_date,sn.NAME AS store_name FROM wf_order o JOIN wf_ship_node sn WHERE 1=1";
			      if((!storeName.equalsIgnoreCase("undefined"))&&(!storeName.equalsIgnoreCase("null"))){
			       query = query + " AND sn.NAME like '%"+storeName+"%'";
			      }
			      if((!startDate.equalsIgnoreCase("undefined"))&&(!storeName.equalsIgnoreCase("null"))){
			           query = query + " AND order_date like '%"+startDate+"%'";
				    }
			      if((!endDate.equalsIgnoreCase("undefined"))&&(!endDate.equalsIgnoreCase("null"))){
				       query = query + " AND order_date like '%"+endDate+"%'";
				    }
			       query = query + " GROUP BY o.order_type";
			System.out.println("query..." + query);
			pstatement = con.prepareStatement(query);
			result = pstatement.executeQuery();	
		
			while (result.next()) {
				AngularChartsData cd = new AngularChartsData();
			        cd.setType(result.getString("order_type"));
	                cd.setId(result.getInt("order_count"));
	                cd.setStoreName(result.getString("store_name"));
	                cd.setQuery(query);
	                l.add(cd);
	            }
		}
		catch(Exception e){
			e.printStackTrace();
		}
		return l;
	}
	@GetMapping("/barChartData")
	public ArrayList getBarChartData(HttpServletRequest request,
			HttpServletResponse response) throws SQLException {
		String resultString ="";
		ArrayList<AngularChartsData> l = new ArrayList<AngularChartsData>();
		String storeName = request.getParameter("storeName");
		String startDate = request.getParameter("startDate");
		String endDate = request.getParameter("endDate");
		
	    System.out.println("------------"+storeName+"---------------");
		try {
			Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root", "Divya@126");
			String query = "SELECT COUNT(o.order_type) AS order_count,o.order_type AS order_type,o.order_date,"
					+ "sn.NAME AS store_name,-(TO_DAYS('"+startDate+"')- TO_DAYS(o.order_date))+1 AS date_value FROM wf_order o JOIN wf_ship_node sn "
					+ "  WHERE 1=1";
			      if((!storeName.equalsIgnoreCase("undefined"))&&(!storeName.equalsIgnoreCase("null"))){
			       query = query + " AND sn.NAME like '%"+storeName+"%'";
			      }
//			      if((!startDate.equalsIgnoreCase("undefined"))&&(!storeName.equalsIgnoreCase("null"))){
//			           query = query + " AND order_date like '%"+startDate+"%'";
//				    }
//			      if((!endDate.equalsIgnoreCase("undefined"))&&(!endDate.equalsIgnoreCase("null"))){
//				       query = query + " AND order_date like '%"+endDate+"%'";
//				    }
			       query = query + " AND (order_date BETWEEN '"+startDate+"' AND '"+endDate+"' ) GROUP BY store_name,o.order_date";
			System.out.println("query..." + query);
			pstatement = con.prepareStatement(query);
			result = pstatement.executeQuery();	
		
			while (result.next()) {
				AngularChartsData cd = new AngularChartsData();
			        cd.setType(result.getString("order_type"));
	                cd.setId(result.getInt("order_count"));
	                cd.setStoreName(result.getString("store_name"));
	                cd.setOrder_date(result.getString("order_date"));
	                cd.setData(result.getString("date_value"));
	                cd.setQuery(query);
	                l.add(cd);
	            }
		}
		catch(Exception e){
			e.printStackTrace();
		}
		return l;
	}
		public String getGridData(String query) throws SQLException {
		String resultString ="Order Type|Order Count|Store Name^";
		try {
			Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test", "root", "Divya@126");
			System.out.println("query..." + query);
			pstatement = con.prepareStatement(query);
			result = pstatement.executeQuery();	
			while (result.next()) {
				  resultString = resultString + result.getString("order_type") +"|" +
	                             result.getInt("order_count")+"|" +
	                             result.getString("store_name")+"^";
		        }
		}
		catch(Exception e){
			e.printStackTrace();
		}
		return resultString;
	}
	 @GetMapping("/xlsDownload")
	public String doDownloadXlsResults(HttpServletRequest request,
			HttpServletResponse response) throws IOException, WriteException, BiffException{
        String filename = "sample";
        filename = filename.concat(".xls");
        OutputStream out = null;
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        WritableWorkbook wworkbook;
        wworkbook = Workbook.createWorkbook(response.getOutputStream());
        WritableSheet wsheet = wworkbook.createSheet("First Sheet", 0);
        Label label;
        String query = request.getParameter("query"); 
        System.out.println("query---------------"+query);
        if (!"".equals(query)) {
            String data = "";
				try {
					data = getGridData(query);
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			query = data;
            WritableFont cellFont = new WritableFont(WritableFont.TIMES, 12);
            cellFont.setColour(Colour.PINK);

            WritableCellFormat cellFormat = new WritableCellFormat(cellFont);
            cellFormat.setBackground(Colour.BLUE);
        
            String[] s = query.split("\\^");
            for (int i = 0; i < s.length; i++) {
               
                String ss = s[i];
                String[] inner = ss.split("\\|");
            
                for (int j = 0; j < inner.length; j++) {
                   
                    if (i == 0) {
                        label = new Label(j, i, inner[j], cellFormat);
                        wsheet.addCell(label);
                    } else {
                        label = new Label(j, i, inner[j]);
                        wsheet.addCell(label);
                    }
                }
            }
        }
        wworkbook.write();
        wworkbook.close();
        if (out != null) {
            out.close();
        }
        return null;
    }
}
